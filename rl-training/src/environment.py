"""
Sensor Optimization RL Environment

Environment Gym-like per il training di agenti RL
per l'ottimizzazione del posizionamento di sensori e junction boxes 3D.
"""

import numpy as np
import gymnasium as gym
from gymnasium import spaces
from typing import Dict, List, Tuple, Optional
import copy


class SensorOptimizationEnv(gym.Env):
    """
    Environment per ottimizzazione posizionamento sensori 3D con constraints.

    State Space:
        Feature vector (512-dim) che include:
        - Distribuzione sensori per tipo
        - Posizioni constraints
        - Junction boxes già piazzati
        - Metriche di coverage

    Action Space:
        Continuous box [0, 1]^5:
        - [0-2]: coordinate (x, y, z) normalizzate
        - [3]: sensor type (normalizzato)
        - [4]: numero porte (normalizzato)

    Reward:
        R = +100 * sensori_connessi
            -0.5 * lunghezza_cavi
            -10 * numero_boxes
            -1000 * violazioni_constraints
            +1000 * bonus_completamento
    """

    metadata = {'render.modes': ['human']}

    def __init__(
        self,
        unitsX: int = 50,
        unitsY: int = 50,
        unitsZ: int = 50,
        num_sensor_types: int = 3,
        sensors_per_type: List[int] = None,
        constraint_ratio: float = 0.1,
        max_junction_boxes: int = 20,
        random_seed: Optional[int] = None
    ):
        """
        Args:
            unitsX, unitsY, unitsZ: Dimensioni spazio 3D
            num_sensor_types: Numero di tipi di sensori diversi
            sensors_per_type: Lista con numero sensori per tipo (None = random)
            constraint_ratio: % del volume occupata da constraints
            max_junction_boxes: Numero massimo di boxes per episodio
            random_seed: Seed per riproducibilità
        """
        super().__init__()

        self.unitsX = unitsX
        self.unitsY = unitsY
        self.unitsZ = unitsZ
        self.num_sensor_types = num_sensor_types
        self.constraint_ratio = constraint_ratio
        self.max_junction_boxes = max_junction_boxes

        if random_seed is not None:
            np.random.seed(random_seed)

        # Define action and observation space
        # Action: [x_norm, y_norm, z_norm, type_norm, ports_norm]
        self.action_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, 0.0]),
            high=np.array([1.0, 1.0, 1.0, 1.0, 1.0]),
            dtype=np.float32
        )

        # Observation: feature vector
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(512,),
            dtype=np.float32
        )

        # Port options
        self.port_options = [6, 12, 24]

        # Initialize state variables
        self.sensors = []
        self.constraints = []
        self.junction_boxes = []
        self.connected_sensors = set()

        # Default sensors per type if not specified
        self.default_sensors_per_type = sensors_per_type or [20, 15, 10]

        # Episode tracking
        self.current_step = 0

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None) -> Tuple[np.ndarray, dict]:
        """
        Reset environment e genera nuova configurazione random

        Returns:
            observation: Initial state
            info: Additional info dict
        """
        if seed is not None:
            np.random.seed(seed)

        # Reset state
        self.sensors = []
        self.constraints = []
        self.junction_boxes = []
        self.connected_sensors = set()
        self.current_step = 0

        # Generate random sensors
        self._generate_sensors()

        # Generate random constraints
        self._generate_constraints()

        # Get initial observation
        observation = self._get_observation()

        info = {
            'num_sensors': len(self.sensors),
            'num_constraints': len(self.constraints),
            'space_volume': self.unitsX * self.unitsY * self.unitsZ
        }

        return observation, info

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, dict]:
        """
        Execute one step in environment

        Args:
            action: [x_norm, y_norm, z_norm, type_norm, ports_norm]

        Returns:
            observation: New state
            reward: Reward for this action
            terminated: True if episode is done (success/failure)
            truncated: True if max steps reached
            info: Additional metrics
        """
        self.current_step += 1

        # Decode action
        x = action[0] * self.unitsX
        y = action[1] * self.unitsY
        z = action[2] * self.unitsZ
        sensor_type = int(action[3] * (self.num_sensor_types - 1))
        ports = self._discretize_ports(action[4])

        # Create junction box
        jbox = {
            'id': len(self.junction_boxes),
            'x': x,
            'y': y,
            'z': z,
            'sensor_type': sensor_type,
            'ports': ports
        }

        # Place junction box
        self.junction_boxes.append(jbox)

        # Calculate reward
        reward, reward_components = self._calculate_reward(jbox)

        # Check if episode is done
        all_connected = self._all_sensors_connected()
        max_boxes_reached = len(self.junction_boxes) >= self.max_junction_boxes
        terminated = all_connected
        truncated = max_boxes_reached and not all_connected

        # Get new observation
        observation = self._get_observation()

        # Info for logging
        info = {
            'total_cable_length': self._calculate_total_cable_length(),
            'num_boxes': len(self.junction_boxes),
            'coverage': self._calculate_coverage(),
            'num_connected': len(self.connected_sensors),
            'num_unconnected': len(self.sensors) - len(self.connected_sensors),
            'constraint_violations': self._count_constraint_violations(),
            'reward_components': reward_components,
            'step': self.current_step
        }

        return observation, reward, terminated, truncated, info

    def _generate_sensors(self):
        """Generate random sensor positions avoiding constraints"""
        self.sensors = []

        for type_id in range(self.num_sensor_types):
            count = self.default_sensors_per_type[type_id]

            for _ in range(count):
                # Try to find valid position (not in constraint)
                max_attempts = 100
                for attempt in range(max_attempts):
                    x = np.random.uniform(0, self.unitsX)
                    y = np.random.uniform(0, self.unitsY)
                    z = np.random.uniform(0, self.unitsZ)

                    if not self._is_position_constrained(x, y, z):
                        self.sensors.append({
                            'id': len(self.sensors),
                            'x': x,
                            'y': y,
                            'z': z,
                            'type': type_id
                        })
                        break

    def _generate_constraints(self):
        """Generate random constraint positions"""
        total_volume = self.unitsX * self.unitsY * self.unitsZ
        num_constraints = int(total_volume * self.constraint_ratio)

        self.constraints = []
        for _ in range(num_constraints):
            self.constraints.append({
                'x': np.random.randint(0, self.unitsX),
                'y': np.random.randint(0, self.unitsY),
                'z': np.random.randint(0, self.unitsZ)
            })

    def _get_observation(self) -> np.ndarray:
        """
        Encode current state as feature vector

        Features include:
        - Per-type sensor statistics (centroid, spread, count, unconnected ratio)
        - Constraint density and distribution
        - Junction box statistics
        - Coverage metrics
        - Space dimensions
        """
        features = []

        # 1. Sensor features per type
        for type_id in range(self.num_sensor_types):
            type_sensors = [s for s in self.sensors if s['type'] == type_id]

            if len(type_sensors) > 0:
                positions = np.array([[s['x'], s['y'], s['z']] for s in type_sensors])

                # Normalized centroid
                centroid = positions.mean(axis=0) / [self.unitsX, self.unitsY, self.unitsZ]
                features.extend(centroid)

                # Normalized std deviation (spread)
                std = positions.std(axis=0) / [self.unitsX, self.unitsY, self.unitsZ]
                features.extend(std)

                # Count (normalized)
                features.append(len(type_sensors) / len(self.sensors))

                # Unconnected ratio
                unconnected = [s for s in type_sensors if s['id'] not in self.connected_sensors]
                features.append(len(unconnected) / len(type_sensors) if len(type_sensors) > 0 else 0)
            else:
                features.extend([0] * 8)  # 3 (centroid) + 3 (std) + 1 (count) + 1 (unconnected)

        # 2. Constraint features
        constraint_density = len(self.constraints) / (self.unitsX * self.unitsY * self.unitsZ)
        features.append(constraint_density)

        if len(self.constraints) > 0:
            constraint_positions = np.array([[c['x'], c['y'], c['z']] for c in self.constraints])
            constraint_centroid = constraint_positions.mean(axis=0) / [self.unitsX, self.unitsY, self.unitsZ]
            features.extend(constraint_centroid)
        else:
            features.extend([0, 0, 0])

        # 3. Junction box features
        features.append(len(self.junction_boxes) / self.max_junction_boxes)

        if len(self.junction_boxes) > 0:
            box_positions = np.array([[b['x'], b['y'], b['z']] for b in self.junction_boxes])
            box_centroid = box_positions.mean(axis=0) / [self.unitsX, self.unitsY, self.unitsZ]
            features.extend(box_centroid)

            # Average ports
            avg_ports = np.mean([b['ports'] for b in self.junction_boxes]) / 24
            features.append(avg_ports)
        else:
            features.extend([0, 0, 0, 0])

        # 4. Coverage metrics
        features.append(self._calculate_coverage())
        features.append(len(self.connected_sensors) / len(self.sensors) if len(self.sensors) > 0 else 0)

        # 5. Unconnected sensors by type
        for type_id in range(self.num_sensor_types):
            type_sensors = [s for s in self.sensors if s['type'] == type_id]
            unconnected = [s for s in type_sensors if s['id'] not in self.connected_sensors]
            features.append(len(unconnected) / len(self.sensors) if len(self.sensors) > 0 else 0)

        # 6. Space dimensions (normalized)
        features.extend([
            self.unitsX / 100,
            self.unitsY / 100,
            self.unitsZ / 100
        ])

        # 7. Step progress
        features.append(self.current_step / self.max_junction_boxes)

        # Convert to numpy array
        features = np.array(features, dtype=np.float32)

        # Pad to 512 dimensions
        if len(features) < 512:
            features = np.pad(features, (0, 512 - len(features)), constant_values=0)
        elif len(features) > 512:
            features = features[:512]

        return features

    def _calculate_reward(self, jbox: dict) -> Tuple[float, dict]:
        """
        Calculate reward for placing junction box

        Returns:
            total_reward: Total reward value
            components: Dict with reward breakdown
        """
        # 1. Coverage reward: newly connected sensors
        newly_connected = self._connect_sensors_to_box(jbox)
        coverage_reward = len(newly_connected) * 100

        # 2. Cable penalty: length of new connections
        cable_length = sum([
            self._distance(
                (s['x'], s['y'], s['z']),
                (jbox['x'], jbox['y'], jbox['z'])
            )
            for s in newly_connected
        ])
        cable_penalty = cable_length * 0.5

        # 3. Box penalty: cost of adding junction box
        box_penalty = 10

        # 4. Constraint violation penalty
        constraint_penalty = 0
        if self._is_position_constrained(jbox['x'], jbox['y'], jbox['z']):
            constraint_penalty = 1000

        # 5. Progress penalty: discourage useless actions
        progress_penalty = 0
        if len(newly_connected) == 0:
            progress_penalty = 50

        # 6. Completion bonus
        completion_bonus = 0
        if self._all_sensors_connected():
            completion_bonus = 1000
            # Extra bonus for efficiency
            if len(self.junction_boxes) < len(self.sensors) / 4:
                completion_bonus += 500

        # Total reward
        total_reward = (
            coverage_reward
            - cable_penalty
            - box_penalty
            - constraint_penalty
            - progress_penalty
            + completion_bonus
        )

        components = {
            'coverage': coverage_reward,
            'cable': -cable_penalty,
            'box': -box_penalty,
            'constraint': -constraint_penalty,
            'progress': -progress_penalty,
            'completion': completion_bonus
        }

        return total_reward, components

    def _connect_sensors_to_box(self, jbox: dict) -> List[dict]:
        """
        Connect closest unconnected sensors to junction box

        Returns:
            List of newly connected sensors
        """
        # Get unconnected sensors of this type
        type_sensors = [
            s for s in self.sensors
            if s['type'] == jbox['sensor_type'] and s['id'] not in self.connected_sensors
        ]

        if len(type_sensors) == 0:
            return []

        # Calculate distances
        distances = [
            (s, self._distance(
                (s['x'], s['y'], s['z']),
                (jbox['x'], jbox['y'], jbox['z'])
            ))
            for s in type_sensors
        ]

        # Sort by distance
        distances.sort(key=lambda x: x[1])

        # Connect up to 'ports' sensors
        newly_connected = []
        for sensor, dist in distances[:jbox['ports']]:
            self.connected_sensors.add(sensor['id'])
            newly_connected.append(sensor)

        return newly_connected

    def _distance(self, pos1: Tuple[float, float, float], pos2: Tuple[float, float, float]) -> float:
        """Euclidean distance between two 3D points"""
        return np.sqrt(
            (pos1[0] - pos2[0]) ** 2 +
            (pos1[1] - pos2[1]) ** 2 +
            (pos1[2] - pos2[2]) ** 2
        )

    def _is_position_constrained(self, x: float, y: float, z: float) -> bool:
        """Check if position overlaps with constraint"""
        x_int = int(np.floor(x))
        y_int = int(np.floor(y))
        z_int = int(np.floor(z))

        return any(
            c['x'] == x_int and c['y'] == y_int and c['z'] == z_int
            for c in self.constraints
        )

    def _discretize_ports(self, normalized_value: float) -> int:
        """Convert normalized value to discrete port count"""
        # normalized_value in [0, 1] -> map to [6, 12, 24]
        if normalized_value < 0.33:
            return 6
        elif normalized_value < 0.67:
            return 12
        else:
            return 24

    def _calculate_total_cable_length(self) -> float:
        """Calculate total cable length for all connections"""
        total_length = 0.0

        for jbox in self.junction_boxes:
            # Get sensors connected to this box
            type_sensors = [s for s in self.sensors if s['type'] == jbox['sensor_type']]

            # Calculate distances
            distances = [
                (s, self._distance(
                    (s['x'], s['y'], s['z']),
                    (jbox['x'], jbox['y'], jbox['z'])
                ))
                for s in type_sensors
                if s['id'] in self.connected_sensors
            ]

            # Sum distances for connected sensors
            distances.sort(key=lambda x: x[1])
            for sensor, dist in distances[:jbox['ports']]:
                total_length += dist

        return total_length

    def _calculate_coverage(self) -> float:
        """Calculate percentage of sensors connected"""
        if len(self.sensors) == 0:
            return 1.0
        return len(self.connected_sensors) / len(self.sensors)

    def _all_sensors_connected(self) -> bool:
        """Check if all sensors are connected"""
        return len(self.connected_sensors) == len(self.sensors)

    def _count_constraint_violations(self) -> int:
        """Count number of junction boxes violating constraints"""
        violations = 0
        for jbox in self.junction_boxes:
            if self._is_position_constrained(jbox['x'], jbox['y'], jbox['z']):
                violations += 1
        return violations

    def render(self, mode='human'):
        """Print current state (for debugging)"""
        if mode == 'human':
            print(f"\n{'='*50}")
            print(f"Step: {self.current_step}")
            print(f"Space: {self.unitsX}x{self.unitsY}x{self.unitsZ}")
            print(f"Sensors: {len(self.sensors)} ({len(self.connected_sensors)} connected)")
            print(f"Junction Boxes: {len(self.junction_boxes)}")
            print(f"Constraints: {len(self.constraints)}")
            print(f"Coverage: {self._calculate_coverage():.2%}")
            print(f"Total Cable Length: {self._calculate_total_cable_length():.2f}")
            print(f"Constraint Violations: {self._count_constraint_violations()}")
            print(f"{'='*50}\n")

    def close(self):
        """Cleanup (if needed)"""
        pass


# Utility function for testing
def test_environment():
    """Quick test dell'environment"""
    print("Testing Sensor Optimization Environment...")

    env = SensorOptimizationEnv(
        unitsX=30,
        unitsY=30,
        unitsZ=30,
        num_sensor_types=3,
        sensors_per_type=[15, 10, 8],
        constraint_ratio=0.1
    )

    obs, info = env.reset()
    print(f"\nInitial observation shape: {obs.shape}")
    print(f"Initial info: {info}")

    env.render()

    # Test a few random actions
    for i in range(5):
        action = env.action_space.sample()
        obs, reward, terminated, truncated, info = env.step(action)

        print(f"\nAction {i+1}:")
        print(f"  Reward: {reward:.2f}")
        print(f"  Coverage: {info['coverage']:.2%}")
        print(f"  Connected: {info['num_connected']}/{info['num_connected'] + info['num_unconnected']}")
        print(f"  Cable Length: {info['total_cable_length']:.2f}")

        if terminated or truncated:
            print(f"\nEpisode finished! Terminated: {terminated}, Truncated: {truncated}")
            break

    env.close()
    print("\nEnvironment test completed!")


if __name__ == '__main__':
    test_environment()
