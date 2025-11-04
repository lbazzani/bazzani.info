# RL Training per Sensor Optimization

Questa cartella contiene tutto il necessario per addestrare un agente di Reinforcement Learning per l'ottimizzazione del posizionamento di sensori e junction boxes 3D.

## Struttura

```
rl-training/
├── README.md                 # Questo file
├── IMPLEMENTATION_PLAN.md    # Piano dettagliato di implementazione
├── src/                      # Codice sorgente
│   ├── environment.py        # Environment Gym per RL
│   ├── agent.py              # Agente DQN/PPO
│   ├── training.py           # Script di training
│   ├── data_collector.py     # Raccolta dati dal sistema attuale
│   └── export_model.py       # Export modello per TensorFlow.js
├── models/                   # Modelli addestrati
│   ├── checkpoints/          # Checkpoint durante training
│   └── final/                # Modelli finali esportati
├── data/                     # Dataset
│   ├── training/             # Training set
│   ├── validation/           # Validation set
│   └── test/                 # Test set
├── logs/                     # Log di training (TensorBoard)
└── notebooks/                # Jupyter notebooks per esperimenti
    ├── 01_environment_test.ipynb
    ├── 02_agent_training.ipynb
    └── 03_evaluation.ipynb
```

## Quick Start

### 1. Setup Environment

```bash
cd rl-training
python3 -m venv venv
source venv/bin/activate  # su macOS/Linux
pip install -r requirements.txt
```

### 2. Raccolta Dati

```bash
# Genera dataset di configurazioni ottimali usando l'ottimizzatore attuale
python src/data_collector.py --num-samples 10000 --output data/training/
```

### 3. Training

```bash
# Train agente DQN
python src/training.py --algorithm dqn --episodes 5000

# Train agente PPO
python src/training.py --algorithm ppo --episodes 5000
```

### 4. Evaluation

```bash
# Test su validation set
python src/evaluate.py --model models/final/dqn_final.pth --test-set data/validation/
```

### 5. Export per Browser

```bash
# Converti modello PyTorch in TensorFlow.js
python src/export_model.py --model models/final/dqn_final.pth --output ../public/models/
```

## Approccio

### Environment RL

**State Space:**
```python
state = {
    'sensor_positions': np.array([N, 4]),  # [x, y, z, type] per N sensori
    'constraint_positions': np.array([M, 3]),  # [x, y, z] per M constraints
    'placed_boxes': np.array([K, 5]),  # [x, y, z, type, ports] per K boxes già piazzati
    'unconnected_sensors': int,  # Numero sensori non connessi
    'space_dims': [unitsX, unitsY, unitsZ]
}
```

**Action Space:**
```python
action = {
    'x': float,  # Coordinata X normalizzata [0, 1]
    'y': float,  # Coordinata Y normalizzata [0, 1]
    'z': float,  # Coordinata Z normalizzata [0, 1]
    'sensor_type': int,  # Tipo di sensore [0, num_types-1]
    'ports': int  # Numero di porte [6, 12, 24]
}
```

**Reward Function:**
```python
reward = (
    connected_sensors * 100 +           # Massimizza sensori connessi
    -total_cable_length * 0.5 +         # Minimizza lunghezza cavi
    -num_junction_boxes * 10 +          # Minimizza numero boxes
    -constraint_violations * 1000 +     # Penalizza violazioni
    coverage_bonus                      # Bonus se tutti connessi
)
```

### Algoritmi Disponibili

1. **DQN (Deep Q-Network)**: Buono per iniziare, discrete action space
2. **PPO (Proximal Policy Optimization)**: Migliore per continuous actions
3. **SAC (Soft Actor-Critic)**: State-of-the-art per continuous control

## Metriche

Durante il training vengono tracciate:
- **Episode Reward**: Reward totale per episodio
- **Average Cable Length**: Lunghezza media cavi
- **Coverage Rate**: % sensori connessi
- **Number of Junction Boxes**: Numero boxes utilizzati
- **Constraint Violations**: Numero violazioni
- **Training Time**: Tempo di training

## Benchmark

Confronto con ottimizzatore algoritmico attuale:

| Metrica | Algoritmo Attuale | RL Agent (Target) |
|---------|-------------------|-------------------|
| Cable Length | Baseline | -15% |
| Junction Boxes | Baseline | -20% |
| Coverage | 100% | 100% |
| Optimization Time | ~2-5s | <100ms |
| Constraint Compliance | 100% | 100% |

## Troubleshooting

### Environment non converge
- Riduci learning rate
- Aumenta dimensione replay buffer
- Modifica reward shaping

### Agent viola constraints
- Aumenta penalità violazioni nel reward
- Aggiungi constraint come parte dello state encoding

### Training troppo lento
- Riduci dimensione network
- Usa GPU con `--device cuda`
- Parallelizza raccolta dati

## Prossimi Step

1. ✅ Setup struttura progetto
2. ⏳ Implementare Environment base
3. ⏳ Implementare DQN agent
4. ⏳ Raccogliere dati training
5. ⏳ Training iniziale
6. ⏳ Evaluation e tuning
7. ⏳ Export per produzione
