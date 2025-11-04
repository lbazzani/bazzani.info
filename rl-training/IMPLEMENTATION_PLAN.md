# Piano di Implementazione RL per Sensor Optimization

## Analisi del Sistema Attuale

### Ottimizzatore Algoritmico Esistente

Dall'analisi del codice in `SensorVisualization.tsx`, l'ottimizzatore attuale usa un approccio **greedy a due fasi**:

#### Fase 1: Consolidamento Junction Boxes
- Raggruppa junction boxes per tipo di sensore
- Calcola porte totali necessarie per tipo
- Consolida boxes quando possibile (risparmia boxes)
- Calcola centroidi per posizionamento ottimale

```typescript
// Logica consolidamento (linee 473-572)
- Group boxes by sensor type
- Calculate if consolidation is possible
- Minimize number of boxes while maintaining coverage
```

#### Fase 2: Ottimizzazione Posizioni
- Per ogni junction box, trova posizione ottimale
- Usa centroide dei sensori non connessi come punto di partenza
- Ricerca su griglia intorno al centroide
- Evita constraints e overlapping

```typescript
// Logica ottimizzazione posizioni (linee 574-700)
- Calculate centroid of unconnected sensors
- Grid search around centroid
- Minimize total cable length
- Respect constraints
```

### Metriche Calcolate

```typescript
totalCableLength = sum(distanze sensore-junction box per ogni connessione)
numJunctionBoxes = conteggio junction boxes finali
coverage = sensori connessi / totale sensori
constraintViolations = conteggio posizioni in zone proibite
```

---

## Architettura RL Proposta

### Environment Design

```python
class SensorOptimizationEnv(gym.Env):
    """
    Environment per ottimizzazione posizionamento sensori 3D

    Simula il processo iterativo di posizionamento junction boxes
    per connettere tutti i sensori minimizzando costi.
    """

    def __init__(self, config):
        self.unitsX = config['unitsX']
        self.unitsY = config['unitsY']
        self.unitsZ = config['unitsZ']
        self.sensors = config['sensors']  # Lista di sensori con pos e tipo
        self.constraints = config['constraints']  # Zone proibite
        self.sensor_types = config['sensor_types']  # Tipi disponibili

        # State space: embedding della configurazione corrente
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(512,),  # Feature vector
            dtype=np.float32
        )

        # Action space: posizione + tipo + porte del prossimo junction box
        self.action_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0]),  # [x, y, z, type, ports]
            high=np.array([1, 1, 1, num_types-1, 24]),
            dtype=np.float32
        )

    def reset(self):
        """Inizializza nuovo episodio con configurazione random"""
        # Genera sensori random rispettando constraints
        # Reset junction boxes piazzati
        # Return initial state

    def step(self, action):
        """
        Piazza junction box secondo action

        Args:
            action: [x_norm, y_norm, z_norm, sensor_type, ports]

        Returns:
            next_state: nuovo state dopo azione
            reward: reward per questa azione
            done: True se episodio finito
            info: metriche addizionali
        """
        # Decodifica action
        x = action[0] * self.unitsX
        y = action[1] * self.unitsY
        z = action[2] * self.unitsZ
        sensor_type = int(action[3])
        ports = self._discretize_ports(action[4])  # 6, 12, or 24

        # Piazza junction box
        jbox = self._place_junction_box(x, y, z, sensor_type, ports)

        # Calcola reward
        reward = self._calculate_reward(jbox)

        # Check se episodio è finito
        done = self._all_sensors_connected() or self._max_boxes_reached()

        # Calcola nuovo state
        next_state = self._get_state()

        # Info addizionali per logging
        info = {
            'total_cable_length': self._calculate_total_cable(),
            'num_boxes': len(self.junction_boxes),
            'coverage': self._calculate_coverage(),
            'constraint_violations': self._count_violations()
        }

        return next_state, reward, done, info

    def _get_state(self):
        """
        Encode current configuration as feature vector

        State encoding include:
        - Sensor distribution statistics
        - Constraint density map
        - Current junction boxes positions
        - Unconnected sensors map
        - Space utilization metrics
        """
        features = []

        # 1. Sensor features (per type)
        for type_id in range(len(self.sensor_types)):
            type_sensors = [s for s in self.sensors if s['type'] == type_id]
            if len(type_sensors) > 0:
                # Centroid
                centroid = np.mean([s['pos'] for s in type_sensors], axis=0)
                features.extend(centroid / [self.unitsX, self.unitsY, self.unitsZ])

                # Standard deviation (spread)
                std = np.std([s['pos'] for s in type_sensors], axis=0)
                features.extend(std / [self.unitsX, self.unitsY, self.unitsZ])

                # Count and density
                features.append(len(type_sensors) / len(self.sensors))
                features.append(len([s for s in type_sensors if not s['connected']]) / len(type_sensors))
            else:
                features.extend([0] * 8)

        # 2. Constraint features
        constraint_density = len(self.constraints) / (self.unitsX * self.unitsY * self.unitsZ)
        features.append(constraint_density)

        # Constraint spatial distribution
        if len(self.constraints) > 0:
            constraint_centroid = np.mean(self.constraints, axis=0)
            features.extend(constraint_centroid / [self.unitsX, self.unitsY, self.unitsZ])
        else:
            features.extend([0, 0, 0])

        # 3. Junction box features
        features.append(len(self.junction_boxes) / 20)  # Normalize by max expected

        if len(self.junction_boxes) > 0:
            box_positions = [b['pos'] for b in self.junction_boxes]
            box_centroid = np.mean(box_positions, axis=0)
            features.extend(box_centroid / [self.unitsX, self.unitsY, self.unitsZ])
        else:
            features.extend([0, 0, 0])

        # 4. Coverage metrics
        features.append(self._calculate_coverage())
        features.append(len([s for s in self.sensors if not s['connected']]) / len(self.sensors))

        # 5. Space utilization
        features.extend([self.unitsX / 100, self.unitsY / 100, self.unitsZ / 100])

        # Pad to fixed size (512)
        features = np.array(features, dtype=np.float32)
        if len(features) < 512:
            features = np.pad(features, (0, 512 - len(features)))

        return features

    def _calculate_reward(self, jbox):
        """
        Reward function che bilancia obiettivi multipli

        Componenti:
        1. Coverage reward: premia sensori connessi
        2. Cable penalty: penalizza lunghezza cavi
        3. Box penalty: penalizza numero boxes
        4. Constraint penalty: penalizza violazioni
        5. Completion bonus: bonus se tutti connessi
        """

        # 1. Sensori connessi da questo box
        connected = self._get_connected_sensors(jbox)
        coverage_reward = len(connected) * 100

        # 2. Lunghezza cavi per questo box
        cable_length = sum([self._distance(s['pos'], jbox['pos']) for s in connected])
        cable_penalty = cable_length * 0.5

        # 3. Penalità per aggiungere box
        box_penalty = 10

        # 4. Penalità violazione constraints
        constraint_penalty = 0
        if self._is_constrained(jbox['pos']):
            constraint_penalty = 1000

        # 5. Bonus completamento
        completion_bonus = 0
        if self._all_sensors_connected():
            completion_bonus = 1000
            # Bonus addizionale se usa pochi boxes
            if len(self.junction_boxes) < len(self.sensors) / 4:
                completion_bonus += 500

        # 6. Penalità per non fare progressi
        progress_penalty = 0
        if len(connected) == 0:
            progress_penalty = 50  # Scoraggia azioni inutili

        total_reward = (
            coverage_reward +
            -cable_penalty +
            -box_penalty +
            -constraint_penalty +
            completion_bonus +
            -progress_penalty
        )

        return total_reward

    def render(self, mode='human'):
        """Visualizza stato corrente (opzionale)"""
        if mode == 'human':
            print(f"Sensors: {len(self.sensors)}, Boxes: {len(self.junction_boxes)}")
            print(f"Coverage: {self._calculate_coverage():.2%}")
            print(f"Cable Length: {self._calculate_total_cable():.2f}")
```

---

## Agent Architecture

### DQN (Deep Q-Network)

```python
class DQNAgent:
    """
    Deep Q-Network agent per ottimizzazione sensori

    Usa experience replay e target network per stabilità.
    """

    def __init__(self, state_dim, action_dim, hidden_dim=256):
        # Q-network principale
        self.q_network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, action_dim)
        )

        # Target network (per stabilità)
        self.target_network = copy.deepcopy(self.q_network)

        # Optimizer
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=1e-4)

        # Replay buffer
        self.replay_buffer = ReplayBuffer(capacity=100000)

        # Hyperparameters
        self.gamma = 0.99  # Discount factor
        self.epsilon = 1.0  # Exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.batch_size = 64

    def select_action(self, state, explore=True):
        """
        Epsilon-greedy action selection
        """
        if explore and np.random.rand() < self.epsilon:
            # Random exploration
            return self._random_action()
        else:
            # Greedy exploitation
            with torch.no_grad():
                state_tensor = torch.FloatTensor(state).unsqueeze(0)
                q_values = self.q_network(state_tensor)
                action_idx = q_values.argmax().item()
                return self._decode_action(action_idx)

    def train_step(self):
        """
        Single training step usando batch da replay buffer
        """
        if len(self.replay_buffer) < self.batch_size:
            return None

        # Sample batch
        batch = self.replay_buffer.sample(self.batch_size)
        states, actions, rewards, next_states, dones = batch

        # Convert to tensors
        states = torch.FloatTensor(states)
        actions = torch.LongTensor(actions)
        rewards = torch.FloatTensor(rewards)
        next_states = torch.FloatTensor(next_states)
        dones = torch.FloatTensor(dones)

        # Current Q values
        current_q = self.q_network(states).gather(1, actions.unsqueeze(1))

        # Target Q values (Bellman equation)
        with torch.no_grad():
            next_q = self.target_network(next_states).max(1)[0]
            target_q = rewards + (1 - dones) * self.gamma * next_q

        # Loss
        loss = nn.MSELoss()(current_q.squeeze(), target_q)

        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.q_network.parameters(), 1.0)
        self.optimizer.step()

        # Decay epsilon
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

        return loss.item()

    def update_target_network(self):
        """Copia weights da q_network a target_network"""
        self.target_network.load_state_dict(self.q_network.state_dict())
```

### PPO (Proximal Policy Optimization) - Alternativa

```python
class PPOAgent:
    """
    PPO agent - migliore per continuous action spaces

    Usa Actor-Critic con clipped objective per stabilità.
    """

    def __init__(self, state_dim, action_dim, hidden_dim=256):
        # Actor network (policy)
        self.actor = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, action_dim),
            nn.Tanh()  # Output in [-1, 1]
        )

        # Critic network (value function)
        self.critic = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, 1)
        )

        # Optimizers
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=3e-4)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=1e-3)

        # Hyperparameters
        self.gamma = 0.99
        self.clip_epsilon = 0.2
        self.ppo_epochs = 10

    def select_action(self, state):
        """Sample action from policy"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action_mean = self.actor(state_tensor)

        # Add exploration noise
        action = action_mean + torch.randn_like(action_mean) * 0.1
        action = torch.clamp(action, -1, 1)

        return action.squeeze(0).detach().numpy()

    def update(self, trajectories):
        """
        PPO update usando collected trajectories
        """
        states = torch.FloatTensor([t['state'] for t in trajectories])
        actions = torch.FloatTensor([t['action'] for t in trajectories])
        old_log_probs = torch.FloatTensor([t['log_prob'] for t in trajectories])
        rewards = torch.FloatTensor([t['reward'] for t in trajectories])

        # Compute advantages
        values = self.critic(states).squeeze()
        advantages = rewards - values.detach()

        # PPO update
        for _ in range(self.ppo_epochs):
            # Actor loss (clipped)
            new_log_probs = self._compute_log_probs(states, actions)
            ratio = torch.exp(new_log_probs - old_log_probs)
            clipped_ratio = torch.clamp(ratio, 1 - self.clip_epsilon, 1 + self.clip_epsilon)
            actor_loss = -torch.min(ratio * advantages, clipped_ratio * advantages).mean()

            # Critic loss
            new_values = self.critic(states).squeeze()
            critic_loss = nn.MSELoss()(new_values, rewards)

            # Update
            self.actor_optimizer.zero_grad()
            actor_loss.backward()
            self.actor_optimizer.step()

            self.critic_optimizer.zero_grad()
            critic_loss.backward()
            self.critic_optimizer.step()
```

---

## Training Pipeline

### Script di Training Principale

```python
# src/training.py

def train_agent(
    env,
    agent,
    num_episodes=5000,
    max_steps_per_episode=50,
    save_interval=100,
    log_dir='logs/'
):
    """
    Training loop principale
    """
    writer = SummaryWriter(log_dir)
    best_reward = -float('inf')

    for episode in range(num_episodes):
        state = env.reset()
        episode_reward = 0
        episode_steps = 0

        for step in range(max_steps_per_episode):
            # Select action
            action = agent.select_action(state, explore=True)

            # Environment step
            next_state, reward, done, info = env.step(action)

            # Store in replay buffer
            agent.replay_buffer.add(state, action, reward, next_state, done)

            # Train agent
            loss = agent.train_step()

            # Update state
            state = next_state
            episode_reward += reward
            episode_steps += 1

            if done:
                break

        # Update target network periodically
        if episode % 10 == 0:
            agent.update_target_network()

        # Logging
        writer.add_scalar('Reward/Episode', episode_reward, episode)
        writer.add_scalar('Steps/Episode', episode_steps, episode)
        writer.add_scalar('Metrics/CableLength', info['total_cable_length'], episode)
        writer.add_scalar('Metrics/NumBoxes', info['num_boxes'], episode)
        writer.add_scalar('Metrics/Coverage', info['coverage'], episode)

        if loss is not None:
            writer.add_scalar('Loss/Training', loss, episode)

        # Save best model
        if episode_reward > best_reward:
            best_reward = episode_reward
            torch.save(agent.q_network.state_dict(), f'models/checkpoints/best_model.pth')

        # Periodic save
        if episode % save_interval == 0:
            torch.save(agent.q_network.state_dict(), f'models/checkpoints/episode_{episode}.pth')

        # Print progress
        if episode % 10 == 0:
            print(f"Episode {episode}/{num_episodes}")
            print(f"  Reward: {episode_reward:.2f}")
            print(f"  Steps: {episode_steps}")
            print(f"  Coverage: {info['coverage']:.2%}")
            print(f"  Cable Length: {info['total_cable_length']:.2f}")
            print(f"  Num Boxes: {info['num_boxes']}")
            print(f"  Epsilon: {agent.epsilon:.3f}")
            print()

    writer.close()
    return agent
```

---

## Data Collection

### Generare Training Data dall'Ottimizzatore Attuale

```python
# src/data_collector.py

def collect_expert_demonstrations(
    num_samples=10000,
    output_dir='data/training/'
):
    """
    Genera dataset di configurazioni ottimali
    usando l'ottimizzatore algoritmico attuale
    """
    dataset = []

    for i in range(num_samples):
        # Genera configurazione random
        config = generate_random_configuration()

        # Ottimizza con algoritmo attuale (expert)
        optimal_solution = algorithmic_optimizer(config)

        # Estrai trajectory (sequence di azioni)
        trajectory = extract_trajectory(config, optimal_solution)

        # Salva
        dataset.append({
            'config': config,
            'solution': optimal_solution,
            'trajectory': trajectory,
            'metrics': {
                'cable_length': optimal_solution['cable_length'],
                'num_boxes': len(optimal_solution['boxes']),
                'coverage': optimal_solution['coverage']
            }
        })

        if i % 100 == 0:
            print(f"Collected {i}/{num_samples} samples")

    # Save dataset
    with open(f'{output_dir}/expert_demos.pkl', 'wb') as f:
        pickle.dump(dataset, f)

    return dataset

def generate_random_configuration():
    """Genera configurazione random ma realistica"""
    unitsX = np.random.randint(20, 100)
    unitsY = np.random.randint(20, 100)
    unitsZ = np.random.randint(20, 100)

    num_sensor_types = np.random.randint(1, 5)
    sensors = []

    for type_id in range(num_sensor_types):
        count = np.random.randint(10, 50)
        sensors.append({'type': type_id, 'count': count})

    # Constraints (5-15% del volume)
    num_constraints = int(0.1 * unitsX * unitsY * unitsZ * np.random.uniform(0.05, 0.15))
    constraints = [
        {'x': np.random.randint(unitsX),
         'y': np.random.randint(unitsY),
         'z': np.random.randint(unitsZ)}
        for _ in range(num_constraints)
    ]

    return {
        'unitsX': unitsX,
        'unitsY': unitsY,
        'unitsZ': unitsZ,
        'sensors': sensors,
        'constraints': constraints
    }
```

---

## Export per Produzione

### Conversione PyTorch → TensorFlow.js

```python
# src/export_model.py

import torch
import tensorflowjs as tfjs
from onnx_tf.backend import prepare

def export_to_tfjs(
    pytorch_model_path,
    output_path='../public/models/rl_optimizer'
):
    """
    Esporta modello PyTorch in formato TensorFlow.js
    """
    # Load PyTorch model
    model = torch.load(pytorch_model_path)
    model.eval()

    # Dummy input per tracing
    dummy_input = torch.randn(1, 512)

    # Export to ONNX
    torch.onnx.export(
        model,
        dummy_input,
        'temp_model.onnx',
        export_params=True,
        opset_version=11,
        input_names=['input'],
        output_names=['output']
    )

    # ONNX to TensorFlow
    onnx_model = onnx.load('temp_model.onnx')
    tf_rep = prepare(onnx_model)
    tf_rep.export_graph('temp_model_tf')

    # TensorFlow to TensorFlow.js
    tfjs.converters.convert_tf_saved_model(
        'temp_model_tf',
        output_path
    )

    print(f"Model exported to {output_path}")
    print("Ready for browser inference!")
```

---

## Timeline

### Fase 1: Setup & Environment (1 settimana)
- [ ] Setup Python environment
- [ ] Implementare `SensorOptimizationEnv`
- [ ] Test environment con random actions
- [ ] Validare reward function

### Fase 2: Agent Implementation (1 settimana)
- [ ] Implementare DQN agent
- [ ] Implementare replay buffer
- [ ] Test training loop base
- [ ] Debug e validazione

### Fase 3: Data Collection (3-5 giorni)
- [ ] Implementare data collector
- [ ] Generare 10,000+ configurazioni
- [ ] Validare qualità dati
- [ ] Split train/val/test

### Fase 4: Training (1-2 settimane)
- [ ] Training iniziale DQN
- [ ] Hyperparameter tuning
- [ ] Implementare PPO (opzionale)
- [ ] Confronto algoritmi

### Fase 5: Evaluation & Export (3-5 giorni)
- [ ] Evaluation su test set
- [ ] Benchmark vs algoritmo attuale
- [ ] Export modello per TensorFlow.js
- [ ] Documentazione risultati

### Fase 6: Integration (1 settimana)
- [ ] Integrare nell'UI esistente
- [ ] A/B testing
- [ ] Performance optimization
- [ ] Deploy

**Totale stimato: 4-6 settimane**

---

## Note Implementative

### Considerazioni Importanti

1. **Discretizzazione Action Space**: Per DQN, discretizzare coordinate e porte in grid
2. **Reward Shaping**: Critico per convergenza - potrebbe richiedere tuning
3. **Constraint Handling**: Penalità forte per violazioni è essenziale
4. **Curriculum Learning**: Iniziare con configurazioni semplici, poi aumentare complessità
5. **Transfer Learning**: Possibile pre-train su configurazioni generate

### Ottimizzazioni

1. **Vectorized Environment**: Parallelizzare raccolta dati
2. **Prioritized Replay**: Campionare transizioni più informative
3. **Hindsight Experience Replay**: Imparare anche da episodi falliti
4. **Multi-Task Learning**: Addestrare su diverse dimensioni spazio contemporaneamente

---

## Risorse

### Librerie Python Richieste
```
torch>=2.0.0
gym>=0.26.0
numpy>=1.24.0
tensorboard>=2.12.0
tensorflowjs>=4.0.0
onnx>=1.14.0
onnx-tf>=1.10.0
```

### Hardware Raccomandato
- **CPU**: Sufficiente per iniziare
- **GPU**: Accelera training 5-10x (raccomandato per >10k episodi)
- **RAM**: 8GB+ (16GB ideale)

### Monitoraggio
- **TensorBoard**: Visualizzazione training in real-time
- **Weights & Biases**: Tracking esperimenti (opzionale)
