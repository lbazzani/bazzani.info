"""
Evaluation e testing script per trained RL agents

Script per valutare performance di agenti addestrati e
confrontarli con baseline algoritmico.
"""

import numpy as np
import torch
import argparse
import json
from pathlib import Path
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns

from environment import SensorOptimizationEnv
from agent import DQNAgent, ActorCriticAgent


def evaluate_agent_detailed(
    env: SensorOptimizationEnv,
    agent,
    num_episodes: int = 100,
    render: bool = False
):
    """
    Evaluation dettagliata con statistiche complete

    Args:
        env: Environment
        agent: Trained agent
        num_episodes: Numero episodi test
        render: Se True, stampa info ogni episodio

    Returns:
        Dict con metriche dettagliate
    """
    results = {
        'rewards': [],
        'coverages': [],
        'cable_lengths': [],
        'num_boxes': [],
        'violations': [],
        'steps': [],
        'success_rate': 0
    }

    successful_episodes = 0

    for ep in tqdm(range(num_episodes), desc="Evaluating"):
        state, info = env.reset()
        episode_reward = 0
        steps = 0
        done = False

        while not done and steps < 50:
            action = agent.select_action(state, explore=False)
            next_state, reward, terminated, truncated, step_info = env.step(action)

            state = next_state
            episode_reward += reward
            steps += 1
            done = terminated or truncated

        # Store metrics
        results['rewards'].append(episode_reward)
        results['coverages'].append(step_info['coverage'])
        results['cable_lengths'].append(step_info['total_cable_length'])
        results['num_boxes'].append(step_info['num_boxes'])
        results['violations'].append(step_info['constraint_violations'])
        results['steps'].append(steps)

        if step_info['coverage'] >= 1.0 and step_info['constraint_violations'] == 0:
            successful_episodes += 1

        if render:
            print(f"\nEpisode {ep + 1}:")
            print(f"  Reward: {episode_reward:.2f}")
            print(f"  Coverage: {step_info['coverage']:.2%}")
            print(f"  Cable Length: {step_info['total_cable_length']:.2f}")
            print(f"  Num Boxes: {step_info['num_boxes']}")
            print(f"  Steps: {steps}")

    # Calculate statistics
    results['success_rate'] = successful_episodes / num_episodes

    # Aggregate statistics
    stats = {
        'mean_reward': np.mean(results['rewards']),
        'std_reward': np.std(results['rewards']),
        'mean_coverage': np.mean(results['coverages']),
        'mean_cable_length': np.mean(results['cable_lengths']),
        'mean_num_boxes': np.mean(results['num_boxes']),
        'mean_violations': np.mean(results['violations']),
        'mean_steps': np.mean(results['steps']),
        'success_rate': results['success_rate']
    }

    return results, stats


def compare_with_baseline(
    env: SensorOptimizationEnv,
    rl_agent,
    num_episodes: int = 50
):
    """
    Confronta RL agent con baseline random

    Args:
        env: Environment
        rl_agent: Trained RL agent
        num_episodes: Numero episodi test

    Returns:
        Dict con confronto
    """
    print("\nEvaluating RL Agent...")
    rl_results, rl_stats = evaluate_agent_detailed(env, rl_agent, num_episodes)

    print("\nEvaluating Random Baseline...")
    # Create random agent
    class RandomAgent:
        def select_action(self, state, explore=False):
            return env.action_space.sample()

    random_agent = RandomAgent()
    random_results, random_stats = evaluate_agent_detailed(env, random_agent, num_episodes)

    # Calculate improvements
    comparison = {
        'rl': rl_stats,
        'random': random_stats,
        'improvements': {
            'coverage': ((rl_stats['mean_coverage'] - random_stats['mean_coverage']) /
                         max(random_stats['mean_coverage'], 0.01) * 100),
            'cable_length': ((random_stats['mean_cable_length'] - rl_stats['mean_cable_length']) /
                             max(random_stats['mean_cable_length'], 0.01) * 100),
            'num_boxes': ((random_stats['mean_num_boxes'] - rl_stats['mean_num_boxes']) /
                          max(random_stats['mean_num_boxes'], 0.01) * 100),
            'success_rate': ((rl_stats['success_rate'] - random_stats['success_rate']) /
                             max(random_stats['success_rate'], 0.01) * 100)
        }
    }

    return comparison


def plot_evaluation_results(results: dict, output_path: str = 'evaluation_plots.png'):
    """
    Crea plot dei risultati evaluation

    Args:
        results: Dict con risultati evaluation
        output_path: Percorso output plot
    """
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    fig.suptitle('RL Agent Evaluation Results', fontsize=16, fontweight='bold')

    # Rewards
    axes[0, 0].hist(results['rewards'], bins=30, edgecolor='black', alpha=0.7)
    axes[0, 0].axvline(np.mean(results['rewards']), color='red', linestyle='--',
                       label=f'Mean: {np.mean(results["rewards"]):.2f}')
    axes[0, 0].set_xlabel('Episode Reward')
    axes[0, 0].set_ylabel('Frequency')
    axes[0, 0].set_title('Reward Distribution')
    axes[0, 0].legend()
    axes[0, 0].grid(alpha=0.3)

    # Coverage
    axes[0, 1].hist(results['coverages'], bins=30, edgecolor='black', alpha=0.7, color='green')
    axes[0, 1].axvline(np.mean(results['coverages']), color='red', linestyle='--',
                       label=f'Mean: {np.mean(results["coverages"]):.2%}')
    axes[0, 1].set_xlabel('Coverage')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].set_title('Coverage Distribution')
    axes[0, 1].legend()
    axes[0, 1].grid(alpha=0.3)

    # Cable Length
    axes[0, 2].hist(results['cable_lengths'], bins=30, edgecolor='black', alpha=0.7, color='orange')
    axes[0, 2].axvline(np.mean(results['cable_lengths']), color='red', linestyle='--',
                       label=f'Mean: {np.mean(results["cable_lengths"]):.2f}')
    axes[0, 2].set_xlabel('Total Cable Length')
    axes[0, 2].set_ylabel('Frequency')
    axes[0, 2].set_title('Cable Length Distribution')
    axes[0, 2].legend()
    axes[0, 2].grid(alpha=0.3)

    # Num Boxes
    axes[1, 0].hist(results['num_boxes'], bins=range(0, max(results['num_boxes'])+2),
                    edgecolor='black', alpha=0.7, color='purple')
    axes[1, 0].axvline(np.mean(results['num_boxes']), color='red', linestyle='--',
                       label=f'Mean: {np.mean(results["num_boxes"]):.1f}')
    axes[1, 0].set_xlabel('Number of Junction Boxes')
    axes[1, 0].set_ylabel('Frequency')
    axes[1, 0].set_title('Junction Box Count Distribution')
    axes[1, 0].legend()
    axes[1, 0].grid(alpha=0.3)

    # Steps
    axes[1, 1].hist(results['steps'], bins=30, edgecolor='black', alpha=0.7, color='brown')
    axes[1, 1].axvline(np.mean(results['steps']), color='red', linestyle='--',
                       label=f'Mean: {np.mean(results["steps"]):.1f}')
    axes[1, 1].set_xlabel('Steps to Completion')
    axes[1, 1].set_ylabel('Frequency')
    axes[1, 1].set_title('Episode Length Distribution')
    axes[1, 1].legend()
    axes[1, 1].grid(alpha=0.3)

    # Success Rate
    success_rate = results.get('success_rate', 0) * 100
    axes[1, 2].bar(['Success', 'Failure'], [success_rate, 100 - success_rate],
                   color=['green', 'red'], alpha=0.7, edgecolor='black')
    axes[1, 2].set_ylabel('Percentage')
    axes[1, 2].set_title(f'Success Rate: {success_rate:.1f}%')
    axes[1, 2].grid(axis='y', alpha=0.3)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"\nPlot saved to: {output_path}")

    return fig


def plot_comparison(comparison: dict, output_path: str = 'comparison_plots.png'):
    """
    Plot confronto RL vs Baseline

    Args:
        comparison: Dict con confronto
        output_path: Percorso output
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle('RL Agent vs Random Baseline', fontsize=16, fontweight='bold')

    # Bar chart metriche
    metrics = ['Coverage', 'Cable\nLength', 'Num\nBoxes', 'Success\nRate']
    rl_values = [
        comparison['rl']['mean_coverage'],
        comparison['rl']['mean_cable_length'],
        comparison['rl']['mean_num_boxes'],
        comparison['rl']['success_rate']
    ]
    random_values = [
        comparison['random']['mean_coverage'],
        comparison['random']['mean_cable_length'],
        comparison['random']['mean_num_boxes'],
        comparison['random']['success_rate']
    ]

    x = np.arange(len(metrics))
    width = 0.35

    axes[0].bar(x - width/2, rl_values, width, label='RL Agent', alpha=0.8)
    axes[0].bar(x + width/2, random_values, width, label='Random', alpha=0.8)
    axes[0].set_ylabel('Value')
    axes[0].set_title('Performance Comparison')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(metrics)
    axes[0].legend()
    axes[0].grid(axis='y', alpha=0.3)

    # Bar chart improvements
    improvements = [
        comparison['improvements']['coverage'],
        -comparison['improvements']['cable_length'],  # Negative because lower is better
        -comparison['improvements']['num_boxes'],  # Negative because lower is better
        comparison['improvements']['success_rate']
    ]

    colors = ['green' if imp > 0 else 'red' for imp in improvements]
    axes[1].bar(metrics, improvements, color=colors, alpha=0.8, edgecolor='black')
    axes[1].set_ylabel('Improvement (%)')
    axes[1].set_title('RL Agent Improvements over Random')
    axes[1].axhline(y=0, color='black', linestyle='-', linewidth=0.5)
    axes[1].grid(axis='y', alpha=0.3)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Comparison plot saved to: {output_path}")

    return fig


def main():
    parser = argparse.ArgumentParser(description='Evaluate trained RL agent')

    # Model args
    parser.add_argument('--model-path', type=str, required=True,
                        help='Path to trained model')
    parser.add_argument('--algorithm', type=str, default='dqn', choices=['dqn', 'ac'],
                        help='Algorithm type')

    # Environment args
    parser.add_argument('--unitsX', type=int, default=50)
    parser.add_argument('--unitsY', type=int, default=50)
    parser.add_argument('--unitsZ', type=int, default=50)
    parser.add_argument('--constraint-ratio', type=float, default=0.1)

    # Eval args
    parser.add_argument('--num-episodes', type=int, default=100,
                        help='Number of evaluation episodes')
    parser.add_argument('--compare-baseline', action='store_true',
                        help='Compare with random baseline')
    parser.add_argument('--render', action='store_true',
                        help='Print episode info')
    parser.add_argument('--output-dir', type=str, default='evaluation_results/',
                        help='Output directory for results')

    args = parser.parse_args()

    # Create output directory
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    # Create environment
    print("Creating environment...")
    env = SensorOptimizationEnv(
        unitsX=args.unitsX,
        unitsY=args.unitsY,
        unitsZ=args.unitsZ,
        constraint_ratio=args.constraint_ratio
    )

    # Load agent
    print(f"Loading {args.algorithm.upper()} agent from {args.model_path}...")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]

    if args.algorithm == 'dqn':
        agent = DQNAgent(state_dim=state_dim, action_dim=action_dim)
        agent.load(args.model_path)
    elif args.algorithm == 'ac':
        agent = ActorCriticAgent(state_dim=state_dim, action_dim=action_dim)
        agent.load(args.model_path)

    # Evaluate
    print(f"\nEvaluating agent on {args.num_episodes} episodes...")
    results, stats = evaluate_agent_detailed(env, agent, args.num_episodes, args.render)

    # Print results
    print(f"\n{'='*60}")
    print("Evaluation Results:")
    print(f"{'='*60}")
    print(f"Mean Reward: {stats['mean_reward']:.2f} ± {stats['std_reward']:.2f}")
    print(f"Mean Coverage: {stats['mean_coverage']:.2%}")
    print(f"Mean Cable Length: {stats['mean_cable_length']:.2f}")
    print(f"Mean Num Boxes: {stats['mean_num_boxes']:.1f}")
    print(f"Mean Violations: {stats['mean_violations']:.1f}")
    print(f"Mean Steps: {stats['mean_steps']:.1f}")
    print(f"Success Rate: {stats['success_rate']:.2%}")
    print(f"{'='*60}\n")

    # Save results
    results_path = f'{args.output_dir}/evaluation_results.json'
    with open(results_path, 'w') as f:
        # Convert numpy arrays to lists for JSON serialization
        json_results = {k: (v.tolist() if isinstance(v, np.ndarray) else v)
                       for k, v in results.items()}
        json.dump({'results': json_results, 'stats': stats}, f, indent=2)
    print(f"Results saved to: {results_path}")

    # Plot results
    plot_path = f'{args.output_dir}/evaluation_plots.png'
    plot_evaluation_results(results, plot_path)

    # Compare with baseline if requested
    if args.compare_baseline:
        print("\nComparing with baseline...")
        comparison = compare_with_baseline(env, agent, num_episodes=50)

        print(f"\n{'='*60}")
        print("Comparison with Random Baseline:")
        print(f"{'='*60}")
        for metric, improvement in comparison['improvements'].items():
            print(f"{metric.replace('_', ' ').title()}: {improvement:+.1f}%")
        print(f"{'='*60}\n")

        # Save comparison
        comparison_path = f'{args.output_dir}/comparison.json'
        with open(comparison_path, 'w') as f:
            json.dump(comparison, f, indent=2)
        print(f"Comparison saved to: {comparison_path}")

        # Plot comparison
        comparison_plot_path = f'{args.output_dir}/comparison_plots.png'
        plot_comparison(comparison, comparison_plot_path)

    env.close()


if __name__ == '__main__':
    main()
