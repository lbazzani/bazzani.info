"""
Deep Q-Network (DQN) Agent per Sensor Optimization

Implementa un agente DQN con experience replay e target network
per stabilità del training.
"""

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import random
from typing import Tuple, List, Dict


class ReplayBuffer:
    """Experience replay buffer per DQN"""

    def __init__(self, capacity: int = 100000):
        """
        Args:
            capacity: Dimensione massima del buffer
        """
        self.buffer = deque(maxlen=capacity)

    def add(
        self,
        state: np.ndarray,
        action: np.ndarray,
        reward: float,
        next_state: np.ndarray,
        done: bool
    ):
        """Aggiunge esperienza al buffer"""
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> Tuple:
        """
        Campiona batch random dal buffer

        Returns:
            Tuple of (states, actions, rewards, next_states, dones)
        """
        batch = random.sample(self.buffer, batch_size)

        states = np.array([exp[0] for exp in batch])
        actions = np.array([exp[1] for exp in batch])
        rewards = np.array([exp[2] for exp in batch])
        next_states = np.array([exp[3] for exp in batch])
        dones = np.array([exp[4] for exp in batch])

        return states, actions, rewards, next_states, dones

    def __len__(self):
        return len(self.buffer)


class QNetwork(nn.Module):
    """
    Neural network per approssimare Q-function

    Architettura: MLP con 3 hidden layers e dropout
    """

    def __init__(
        self,
        state_dim: int,
        action_dim: int,
        hidden_dim: int = 256,
        dropout: float = 0.2
    ):
        """
        Args:
            state_dim: Dimensione state space
            action_dim: Dimensione action space
            hidden_dim: Numero neuroni hidden layers
            dropout: Dropout rate per regolarizzazione
        """
        super(QNetwork, self).__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, action_dim)
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """Forward pass"""
        return self.network(state)


class DQNAgent:
    """
    Deep Q-Network Agent per ottimizzazione sensori

    Features:
    - Experience replay per decorrelazione samples
    - Target network per stabilità training
    - Epsilon-greedy exploration
    - Gradient clipping
    """

    def __init__(
        self,
        state_dim: int,
        action_dim: int,
        hidden_dim: int = 256,
        learning_rate: float = 1e-4,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.01,
        epsilon_decay: float = 0.995,
        batch_size: int = 64,
        buffer_capacity: int = 100000,
        device: str = None
    ):
        """
        Args:
            state_dim: Dimensione state space
            action_dim: Dimensione action space (5: x, y, z, type, ports)
            hidden_dim: Dimensione hidden layers
            learning_rate: Learning rate per optimizer
            gamma: Discount factor
            epsilon_start: Exploration rate iniziale
            epsilon_end: Exploration rate minima
            epsilon_decay: Decay rate per epsilon
            batch_size: Batch size per training
            buffer_capacity: Capacità replay buffer
            device: 'cuda' o 'cpu' (None = auto-detect)
        """
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size

        # Device
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        print(f"DQN Agent initialized on device: {self.device}")

        # Q-network (online)
        self.q_network = QNetwork(state_dim, action_dim, hidden_dim).to(self.device)

        # Target network (for stability)
        self.target_network = QNetwork(state_dim, action_dim, hidden_dim).to(self.device)
        self.target_network.load_state_dict(self.q_network.state_dict())
        self.target_network.eval()

        # Optimizer
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)

        # Replay buffer
        self.replay_buffer = ReplayBuffer(buffer_capacity)

        # Training stats
        self.training_steps = 0
        self.losses = []

    def select_action(self, state: np.ndarray, explore: bool = True) -> np.ndarray:
        """
        Select action using epsilon-greedy policy

        Per continuous action space, discretizziamo in grid e poi
        selezioniamo l'azione con Q-value più alto.

        Args:
            state: Current state observation
            explore: Se True, usa epsilon-greedy; altrimenti greedy

        Returns:
            action: Array [x, y, z, type, ports] normalizzato in [0, 1]
        """
        if explore and np.random.rand() < self.epsilon:
            # Random exploration
            return self._random_action()
        else:
            # Greedy exploitation
            with torch.no_grad():
                state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)

                # Forward pass attraverso Q-network
                q_values = self.q_network(state_tensor)

                # Per semplicità, facciamo discretizzazione grossolana
                # e prendiamo l'azione con Q-value più alto
                # In pratica, il network output è già un vettore continuo
                # che possiamo usare direttamente con sigmoid/tanh

                # Qui usiamo un trucco: network output -> sigmoid -> [0, 1]
                action = torch.sigmoid(q_values).cpu().numpy()[0]

                return action

    def _random_action(self) -> np.ndarray:
        """Generate random action"""
        return np.random.uniform(0, 1, size=self.action_dim).astype(np.float32)

    def store_transition(
        self,
        state: np.ndarray,
        action: np.ndarray,
        reward: float,
        next_state: np.ndarray,
        done: bool
    ):
        """Store transition in replay buffer"""
        self.replay_buffer.add(state, action, reward, next_state, done)

    def train_step(self) -> float:
        """
        Single training step usando batch dal replay buffer

        Returns:
            loss: Training loss (None se buffer troppo piccolo)
        """
        # Check se abbiamo abbastanza samples
        if len(self.replay_buffer) < self.batch_size:
            return None

        # Sample batch
        states, actions, rewards, next_states, dones = self.replay_buffer.sample(
            self.batch_size
        )

        # Convert to tensors
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.FloatTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)

        # Current Q values
        current_q = self.q_network(states)

        # Per regression, vogliamo predire l'action stessa
        # In questo caso usiamo MSE tra predicted action e actual action
        # pesato dal reward (questo è un approccio semplificato)

        # Alternatively: Double DQN approach
        with torch.no_grad():
            # Best actions per next state usando online network
            next_actions = self.q_network(next_states)
            # Q-values per next state usando target network
            next_q = self.target_network(next_states)

            # Target: reward + gamma * max_a Q(s', a) * (1 - done)
            # Per continuous, usiamo la norma del vettore come proxy per Q-value
            target_q_values = rewards + (1 - dones) * self.gamma * next_q.norm(dim=1)

        # Current Q-values (norma del vettore predetto)
        current_q_values = current_q.norm(dim=1)

        # Loss: MSE tra current e target Q-values
        loss = nn.MSELoss()(current_q_values, target_q_values)

        # Optimize
        self.optimizer.zero_grad()
        loss.backward()

        # Gradient clipping per stabilità
        nn.utils.clip_grad_norm_(self.q_network.parameters(), max_norm=1.0)

        self.optimizer.step()

        # Update training stats
        self.training_steps += 1
        loss_value = loss.item()
        self.losses.append(loss_value)

        # Decay epsilon
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

        return loss_value

    def update_target_network(self):
        """Copia pesi da q_network a target_network"""
        self.target_network.load_state_dict(self.q_network.state_dict())

    def save(self, path: str):
        """
        Salva modello e stato agent

        Args:
            path: Percorso file dove salvare
        """
        torch.save({
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'training_steps': self.training_steps,
            'losses': self.losses
        }, path)

        print(f"Agent saved to {path}")

    def load(self, path: str):
        """
        Carica modello e stato agent

        Args:
            path: Percorso file da cui caricare
        """
        checkpoint = torch.load(path, map_location=self.device)

        self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
        self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.epsilon = checkpoint['epsilon']
        self.training_steps = checkpoint['training_steps']
        self.losses = checkpoint['losses']

        print(f"Agent loaded from {path}")

    def get_stats(self) -> Dict:
        """Restituisce statistiche training"""
        return {
            'training_steps': self.training_steps,
            'epsilon': self.epsilon,
            'buffer_size': len(self.replay_buffer),
            'avg_loss': np.mean(self.losses[-100:]) if len(self.losses) > 0 else 0,
            'total_losses': len(self.losses)
        }


# Alternative: Actor-Critic Agent (più adatto per continuous actions)
class ActorCriticAgent:
    """
    Actor-Critic agent per continuous action space

    Actor: Policy network che output action direttamente
    Critic: Value network che stima V(s)
    """

    def __init__(
        self,
        state_dim: int,
        action_dim: int,
        hidden_dim: int = 256,
        actor_lr: float = 3e-4,
        critic_lr: float = 1e-3,
        gamma: float = 0.99,
        device: str = None
    ):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma

        # Device
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        # Actor network (policy)
        self.actor = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, action_dim),
            nn.Sigmoid()  # Output in [0, 1]
        ).to(self.device)

        # Critic network (value function)
        self.critic = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        ).to(self.device)

        # Optimizers
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=actor_lr)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=critic_lr)

        print(f"Actor-Critic Agent initialized on device: {self.device}")

    def select_action(self, state: np.ndarray, explore: bool = True) -> np.ndarray:
        """Select action from policy"""
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            action = self.actor(state_tensor).cpu().numpy()[0]

            if explore:
                # Add exploration noise
                noise = np.random.normal(0, 0.1, size=action.shape)
                action = np.clip(action + noise, 0, 1)

            return action.astype(np.float32)

    def update(
        self,
        state: np.ndarray,
        action: np.ndarray,
        reward: float,
        next_state: np.ndarray,
        done: bool
    ) -> Tuple[float, float]:
        """
        Update actor e critic

        Returns:
            actor_loss, critic_loss
        """
        # Convert to tensors
        state_t = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        action_t = torch.FloatTensor(action).unsqueeze(0).to(self.device)
        reward_t = torch.FloatTensor([reward]).to(self.device)
        next_state_t = torch.FloatTensor(next_state).unsqueeze(0).to(self.device)
        done_t = torch.FloatTensor([done]).to(self.device)

        # Critic update (TD learning)
        with torch.no_grad():
            next_value = self.critic(next_state_t)
            target_value = reward_t + (1 - done_t) * self.gamma * next_value

        current_value = self.critic(state_t)
        critic_loss = nn.MSELoss()(current_value, target_value)

        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Actor update (policy gradient)
        predicted_action = self.actor(state_t)
        value = self.critic(state_t)

        # Advantage = actual reward - expected value
        advantage = (target_value - value).detach()

        # Actor loss: maximize advantage
        actor_loss = -advantage * nn.MSELoss()(predicted_action, action_t)

        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()

        return actor_loss.item(), critic_loss.item()

    def save(self, path: str):
        """Salva modello"""
        torch.save({
            'actor_state_dict': self.actor.state_dict(),
            'critic_state_dict': self.critic.state_dict(),
            'actor_optimizer_state_dict': self.actor_optimizer.state_dict(),
            'critic_optimizer_state_dict': self.critic_optimizer.state_dict()
        }, path)

    def load(self, path: str):
        """Carica modello"""
        checkpoint = torch.load(path, map_location=self.device)
        self.actor.load_state_dict(checkpoint['actor_state_dict'])
        self.critic.load_state_dict(checkpoint['critic_state_dict'])
        self.actor_optimizer.load_state_dict(checkpoint['actor_optimizer_state_dict'])
        self.critic_optimizer.load_state_dict(checkpoint['critic_optimizer_state_dict'])


if __name__ == '__main__':
    # Test agent
    print("Testing DQN Agent...")

    state_dim = 512
    action_dim = 5

    agent = DQNAgent(
        state_dim=state_dim,
        action_dim=action_dim,
        hidden_dim=256
    )

    # Test action selection
    dummy_state = np.random.randn(state_dim).astype(np.float32)
    action = agent.select_action(dummy_state, explore=True)

    print(f"State shape: {dummy_state.shape}")
    print(f"Action shape: {action.shape}")
    print(f"Action values: {action}")
    print(f"Agent stats: {agent.get_stats()}")

    print("\nAgent test completed!")
