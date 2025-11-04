"""
Training script per RL Agent

Script principale per addestrare l'agente RL su environment
di ottimizzazione sensori.
"""

import numpy as np
import torch
from torch.utils.tensorboard import SummaryWriter
import argparse
from datetime import datetime
from pathlib import Path
from tqdm import tqdm
import json

from environment import SensorOptimizationEnv
from agent import DQNAgent, ActorCriticAgent


def train_dqn(
    env: SensorOptimizationEnv,
    agent: DQNAgent,
    num_episodes: int = 5000,
    max_steps_per_episode: int = 50,
    target_update_freq: int = 10,
    save_interval: int = 100,
    eval_interval: int = 50,
    log_dir: str = 'logs/',
    checkpoint_dir: str = 'models/checkpoints/'
):
    """
    Training loop per DQN agent

    Args:
        env: Environment
        agent: DQN Agent
        num_episodes: Numero episodi training
        max_steps_per_episode: Max step per episodio
        target_update_freq: Frequenza update target network (episodi)
        save_interval: Frequenza salvataggio checkpoint (episodi)
        eval_interval: Frequenza evaluation (episodi)
        log_dir: Directory per TensorBoard logs
        checkpoint_dir: Directory per checkpoint modelli
    """
    # Setup directories
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)

    # TensorBoard writer
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    writer = SummaryWriter(f'{log_dir}/dqn_{timestamp}')

    # Training stats
    best_reward = -float('inf')
    episode_rewards = []
    episode_lengths = []

    print(f"\n{'='*60}")
    print(f"Starting DQN Training")
    print(f"Episodes: {num_episodes}")
    print(f"Max steps per episode: {max_steps_per_episode}")
    print(f"Device: {agent.device}")
    print(f"{'='*60}\n")

    # Training loop
    for episode in tqdm(range(num_episodes), desc="Training"):
        # Reset environment
        state, info = env.reset()
        episode_reward = 0
        episode_length = 0

        # Episode loop
        for step in range(max_steps_per_episode):
            # Select action
            action = agent.select_action(state, explore=True)

            # Environment step
            next_state, reward, terminated, truncated, step_info = env.step(action)

            # Store transition
            done = terminated or truncated
            agent.store_transition(state, action, reward, next_state, done)

            # Train agent
            loss = agent.train_step()

            # Update state
            state = next_state
            episode_reward += reward
            episode_length += 1

            # Log step info
            if loss is not None:
                writer.add_scalar('Loss/Step', loss, agent.training_steps)

            if terminated or truncated:
                break

        # Update target network periodically
        if episode % target_update_freq == 0:
            agent.update_target_network()

        # Store episode stats
        episode_rewards.append(episode_reward)
        episode_lengths.append(episode_length)

        # Log episode metrics
        writer.add_scalar('Reward/Episode', episode_reward, episode)
        writer.add_scalar('Length/Episode', episode_length, episode)
        writer.add_scalar('Metrics/Coverage', step_info['coverage'], episode)
        writer.add_scalar('Metrics/CableLength', step_info['total_cable_length'], episode)
        writer.add_scalar('Metrics/NumBoxes', step_info['num_boxes'], episode)
        writer.add_scalar('Metrics/Violations', step_info['constraint_violations'], episode)
        writer.add_scalar('Agent/Epsilon', agent.epsilon, episode)

        # Log reward components
        if 'reward_components' in step_info:
            for key, value in step_info['reward_components'].items():
                writer.add_scalar(f'RewardComponents/{key}', value, episode)

        # Save best model
        if episode_reward > best_reward:
            best_reward = episode_reward
            agent.save(f'{checkpoint_dir}/best_model.pth')
            writer.add_scalar('BestReward', best_reward, episode)

        # Periodic checkpoint
        if episode % save_interval == 0 and episode > 0:
            agent.save(f'{checkpoint_dir}/episode_{episode}.pth')

        # Periodic evaluation
        if episode % eval_interval == 0 and episode > 0:
            eval_metrics = evaluate_agent(env, agent, num_episodes=5)
            for key, value in eval_metrics.items():
                writer.add_scalar(f'Eval/{key}', value, episode)

            # Print progress
            recent_rewards = episode_rewards[-100:]
            avg_reward = np.mean(recent_rewards)
            avg_length = np.mean(episode_lengths[-100:])

            print(f"\n{'='*60}")
            print(f"Episode {episode}/{num_episodes}")
            print(f"Avg Reward (last 100): {avg_reward:.2f}")
            print(f"Avg Length (last 100): {avg_length:.1f}")
            print(f"Best Reward: {best_reward:.2f}")
            print(f"Epsilon: {agent.epsilon:.3f}")
            print(f"Eval Coverage: {eval_metrics['coverage']:.2%}")
            print(f"Eval Cable Length: {eval_metrics['cable_length']:.2f}")
            print(f"Eval Num Boxes: {eval_metrics['num_boxes']:.1f}")
            print(f"{'='*60}\n")

    # Final save
    agent.save(f'{checkpoint_dir}/final_model.pth')

    # Save training stats
    stats = {
        'episode_rewards': episode_rewards,
        'episode_lengths': episode_lengths,
        'best_reward': best_reward,
        'final_epsilon': agent.epsilon
    }
    with open(f'{checkpoint_dir}/training_stats.json', 'w') as f:
        json.dump(stats, f, indent=2)

    writer.close()

    print(f"\nTraining completed!")
    print(f"Best reward: {best_reward:.2f}")
    print(f"Models saved to: {checkpoint_dir}")

    return agent, stats


def train_actor_critic(
    env: SensorOptimizationEnv,
    agent: ActorCriticAgent,
    num_episodes: int = 5000,
    max_steps_per_episode: int = 50,
    save_interval: int = 100,
    eval_interval: int = 50,
    log_dir: str = 'logs/',
    checkpoint_dir: str = 'models/checkpoints/'
):
    """Training loop per Actor-Critic agent"""
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    writer = SummaryWriter(f'{log_dir}/ac_{timestamp}')

    best_reward = -float('inf')
    episode_rewards = []

    print(f"\n{'='*60}")
    print(f"Starting Actor-Critic Training")
    print(f"Episodes: {num_episodes}")
    print(f"Device: {agent.device}")
    print(f"{'='*60}\n")

    for episode in tqdm(range(num_episodes), desc="Training"):
        state, info = env.reset()
        episode_reward = 0
        episode_length = 0

        for step in range(max_steps_per_episode):
            action = agent.select_action(state, explore=True)
            next_state, reward, terminated, truncated, step_info = env.step(action)

            # Update agent
            actor_loss, critic_loss = agent.update(
                state, action, reward, next_state, terminated or truncated
            )

            state = next_state
            episode_reward += reward
            episode_length += 1

            # Log losses
            writer.add_scalar('Loss/Actor', actor_loss, episode * max_steps_per_episode + step)
            writer.add_scalar('Loss/Critic', critic_loss, episode * max_steps_per_episode + step)

            if terminated or truncated:
                break

        episode_rewards.append(episode_reward)

        # Logging
        writer.add_scalar('Reward/Episode', episode_reward, episode)
        writer.add_scalar('Length/Episode', episode_length, episode)
        writer.add_scalar('Metrics/Coverage', step_info['coverage'], episode)
        writer.add_scalar('Metrics/CableLength', step_info['total_cable_length'], episode)
        writer.add_scalar('Metrics/NumBoxes', step_info['num_boxes'], episode)

        # Save best
        if episode_reward > best_reward:
            best_reward = episode_reward
            agent.save(f'{checkpoint_dir}/best_model.pth')

        # Periodic save
        if episode % save_interval == 0 and episode > 0:
            agent.save(f'{checkpoint_dir}/episode_{episode}.pth')

        # Periodic eval
        if episode % eval_interval == 0 and episode > 0:
            eval_metrics = evaluate_agent(env, agent, num_episodes=5)
            for key, value in eval_metrics.items():
                writer.add_scalar(f'Eval/{key}', value, episode)

            avg_reward = np.mean(episode_rewards[-100:])
            print(f"\nEpisode {episode}: Avg Reward = {avg_reward:.2f}, Best = {best_reward:.2f}")

    agent.save(f'{checkpoint_dir}/final_model.pth')
    writer.close()

    return agent


def evaluate_agent(
    env: SensorOptimizationEnv,
    agent,
    num_episodes: int = 10
) -> dict:
    """
    Evaluate agent performance

    Args:
        env: Environment
        agent: Trained agent
        num_episodes: Numero episodi evaluation

    Returns:
        Dict con metriche aggregate
    """
    rewards = []
    coverages = []
    cable_lengths = []
    num_boxes_list = []
    violations = []

    for _ in range(num_episodes):
        state, info = env.reset()
        episode_reward = 0
        done = False

        while not done:
            # Greedy action (no exploration)
            action = agent.select_action(state, explore=False)
            next_state, reward, terminated, truncated, step_info = env.step(action)

            state = next_state
            episode_reward += reward
            done = terminated or truncated

        rewards.append(episode_reward)
        coverages.append(step_info['coverage'])
        cable_lengths.append(step_info['total_cable_length'])
        num_boxes_list.append(step_info['num_boxes'])
        violations.append(step_info['constraint_violations'])

    return {
        'reward': np.mean(rewards),
        'coverage': np.mean(coverages),
        'cable_length': np.mean(cable_lengths),
        'num_boxes': np.mean(num_boxes_list),
        'violations': np.mean(violations),
        'reward_std': np.std(rewards)
    }


def main():
    parser = argparse.ArgumentParser(description='Train RL Agent for Sensor Optimization')

    # Environment args
    parser.add_argument('--unitsX', type=int, default=50, help='Space dimension X')
    parser.add_argument('--unitsY', type=int, default=50, help='Space dimension Y')
    parser.add_argument('--unitsZ', type=int, default=50, help='Space dimension Z')
    parser.add_argument('--constraint-ratio', type=float, default=0.1, help='Constraint density')

    # Agent args
    parser.add_argument('--algorithm', type=str, default='dqn', choices=['dqn', 'ac'],
                        help='Algorithm: dqn or ac (actor-critic)')
    parser.add_argument('--hidden-dim', type=int, default=256, help='Hidden layer dimension')
    parser.add_argument('--learning-rate', type=float, default=1e-4, help='Learning rate')

    # Training args
    parser.add_argument('--episodes', type=int, default=5000, help='Number of episodes')
    parser.add_argument('--max-steps', type=int, default=50, help='Max steps per episode')
    parser.add_argument('--batch-size', type=int, default=64, help='Batch size')
    parser.add_argument('--gamma', type=float, default=0.99, help='Discount factor')

    # Logging args
    parser.add_argument('--log-dir', type=str, default='logs/', help='TensorBoard log directory')
    parser.add_argument('--checkpoint-dir', type=str, default='models/checkpoints/',
                        help='Checkpoint directory')
    parser.add_argument('--save-interval', type=int, default=100, help='Save interval')
    parser.add_argument('--eval-interval', type=int, default=50, help='Eval interval')

    # Device
    parser.add_argument('--device', type=str, default=None, choices=['cpu', 'cuda'],
                        help='Device (None = auto)')

    args = parser.parse_args()

    # Create environment
    print("Creating environment...")
    env = SensorOptimizationEnv(
        unitsX=args.unitsX,
        unitsY=args.unitsY,
        unitsZ=args.unitsZ,
        constraint_ratio=args.constraint_ratio
    )

    # Create agent
    print(f"Creating {args.algorithm.upper()} agent...")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]

    if args.algorithm == 'dqn':
        agent = DQNAgent(
            state_dim=state_dim,
            action_dim=action_dim,
            hidden_dim=args.hidden_dim,
            learning_rate=args.learning_rate,
            gamma=args.gamma,
            batch_size=args.batch_size,
            device=args.device
        )

        # Train
        trained_agent, stats = train_dqn(
            env=env,
            agent=agent,
            num_episodes=args.episodes,
            max_steps_per_episode=args.max_steps,
            save_interval=args.save_interval,
            eval_interval=args.eval_interval,
            log_dir=args.log_dir,
            checkpoint_dir=args.checkpoint_dir
        )

    elif args.algorithm == 'ac':
        agent = ActorCriticAgent(
            state_dim=state_dim,
            action_dim=action_dim,
            hidden_dim=args.hidden_dim,
            actor_lr=args.learning_rate,
            gamma=args.gamma,
            device=args.device
        )

        # Train
        trained_agent = train_actor_critic(
            env=env,
            agent=agent,
            num_episodes=args.episodes,
            max_steps_per_episode=args.max_steps,
            save_interval=args.save_interval,
            eval_interval=args.eval_interval,
            log_dir=args.log_dir,
            checkpoint_dir=args.checkpoint_dir
        )

    # Final evaluation
    print("\nRunning final evaluation...")
    final_metrics = evaluate_agent(env, trained_agent, num_episodes=20)
    print(f"\n{'='*60}")
    print("Final Evaluation Results:")
    print(f"  Average Reward: {final_metrics['reward']:.2f} ± {final_metrics['reward_std']:.2f}")
    print(f"  Coverage: {final_metrics['coverage']:.2%}")
    print(f"  Cable Length: {final_metrics['cable_length']:.2f}")
    print(f"  Num Boxes: {final_metrics['num_boxes']:.1f}")
    print(f"  Violations: {final_metrics['violations']:.1f}")
    print(f"{'='*60}\n")

    env.close()


if __name__ == '__main__':
    main()
