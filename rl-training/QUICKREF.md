# 🚀 Quick Reference Card - RL Training

Comandi essenziali e parametri chiave sempre a portata di mano.

---

## ⚡ Comandi Essenziali

### Setup (Prima Volta)
```bash
cd rl-training
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### Test Rapidi
```bash
python src/environment.py  # Test environment
python src/agent.py        # Test agent
```

### Training
```bash
# Veloce (5 min)
python src/training.py --episodes 100 --max-steps 20

# Normale (2-3 ore)
python src/training.py --episodes 5000

# Con GPU
python src/training.py --episodes 5000 --device cuda

# Background
nohup python src/training.py --episodes 5000 > train.log 2>&1 &
```

### Monitoring
```bash
# TensorBoard
tensorboard --logdir logs/

# Log in tempo reale
tail -f train.log
```

### Evaluation
```bash
python src/evaluate.py \
  --model-path models/checkpoints/best_model.pth \
  --num-episodes 100 \
  --compare-baseline
```

### Jupyter
```bash
jupyter notebook notebooks/01_quick_start.ipynb
```

---

## 🎛️ Parametri Principali

### Environment
| Parametro | Default | Descrizione | Range |
|-----------|---------|-------------|-------|
| `--unitsX` | 50 | Dimensione X | 20-100 |
| `--unitsY` | 50 | Dimensione Y | 20-100 |
| `--unitsZ` | 50 | Dimensione Z | 20-100 |
| `--constraint-ratio` | 0.1 | % constraints | 0.0-0.3 |

### Agent
| Parametro | Default | Descrizione | Range |
|-----------|---------|-------------|-------|
| `--algorithm` | dqn | Algoritmo | dqn, ac |
| `--hidden-dim` | 256 | Dimensione hidden | 128-512 |
| `--learning-rate` | 1e-4 | Learning rate | 1e-5 to 1e-3 |
| `--gamma` | 0.99 | Discount factor | 0.9-0.999 |
| `--batch-size` | 64 | Batch size | 32-128 |

### Training
| Parametro | Default | Descrizione | Range |
|-----------|---------|-------------|-------|
| `--episodes` | 5000 | Num episodi | 100-10000 |
| `--max-steps` | 50 | Max step/ep | 20-100 |
| `--save-interval` | 100 | Save ogni N | 50-200 |
| `--eval-interval` | 50 | Eval ogni N | 20-100 |
| `--device` | auto | Device | cpu, cuda |

---

## 📊 Metriche Chiave

### Durante Training (TensorBoard)
```
Reward/Episode          ↗️ Deve crescere
Loss/Training           ↘️ Deve diminuire
Metrics/Coverage        ↗️ → 100%
Metrics/CableLength     ↘️ Deve diminuire
Metrics/NumBoxes        ↘️ Deve diminuire
Metrics/Violations      ↘️ → 0
Agent/Epsilon           ↘️ 1.0 → 0.01
```

### Target Finali
```
Coverage:        > 95%
Cable Length:    Minimizzato
Num Boxes:       < Baseline algoritmico
Violations:      = 0
Success Rate:    > 80%
Optimization:    < 100ms
```

---

## 🗂️ Struttura File

```
rl-training/
├── src/
│   ├── environment.py     # Environment Gym
│   ├── agent.py           # DQN/AC agents
│   ├── training.py        # Training script
│   └── evaluate.py        # Evaluation script
│
├── models/
│   └── checkpoints/
│       ├── best_model.pth        # Best model
│       └── episode_*.pth         # Checkpoints
│
├── logs/
│   └── dqn_*/                    # TensorBoard logs
│
├── notebooks/
│   └── 01_quick_start.ipynb     # Interactive tutorial
│
└── docs (*.md)
    ├── README.md                 # ⭐ Start here
    ├── GETTING_STARTED.md        # Setup guide
    ├── ARCHITECTURE.md           # System design
    ├── IMPLEMENTATION_PLAN.md    # Tech details
    ├── SUMMARY.md                # Overview
    ├── INDEX.md                  # Navigation
    └── QUICKREF.md              # This file
```

---

## 🔥 Workflow Comuni

### Workflow 1: Test Rapido
```bash
# 5 minuti
python src/environment.py
python src/agent.py
python src/training.py --episodes 50
```

### Workflow 2: Training Completo
```bash
# Start training (background)
nohup python src/training.py \
  --episodes 5000 \
  --log-dir logs/ \
  --checkpoint-dir models/checkpoints/ \
  > training.log 2>&1 &

# Monitor
tensorboard --logdir logs/ &
tail -f training.log

# Dopo training
python src/evaluate.py \
  --model-path models/checkpoints/best_model.pth \
  --num-episodes 100 \
  --compare-baseline \
  --output-dir evaluation_results/
```

### Workflow 3: Hyperparameter Tuning
```bash
# Test diversi learning rates
for lr in 1e-5 1e-4 1e-3; do
  python src/training.py \
    --learning-rate $lr \
    --episodes 1000 \
    --log-dir logs/lr_$lr/ &
done

# Monitor tutti
tensorboard --logdir logs/
```

---

## 🛠️ Customizzazioni Comuni

### Modificare Reward Function
```python
# File: src/environment.py
# Funzione: _calculate_reward() (circa linea 240)

def _calculate_reward(self, jbox):
    # Modifica questi valori:
    coverage_reward = len(newly_connected) * 100  # ← Cambia 100
    cable_penalty = cable_length * 0.5            # ← Cambia 0.5
    box_penalty = 10                              # ← Cambia 10
    constraint_penalty = 1000                     # ← Cambia 1000
    completion_bonus = 1000                       # ← Cambia 1000

    total_reward = (
        coverage_reward
        - cable_penalty
        - box_penalty
        - constraint_penalty
        + completion_bonus
    )
    return total_reward
```

### Aggiungere Features allo State
```python
# File: src/environment.py
# Funzione: _get_observation() (circa linea 150)

def _get_observation(self):
    features = []

    # Features esistenti
    features.extend(sensor_features)
    features.extend(constraint_features)

    # AGGIUNGI QUI nuove features
    custom_feature = self._calculate_custom_metric()
    features.append(custom_feature)

    # Padding a 512
    features = np.array(features, dtype=np.float32)
    if len(features) < 512:
        features = np.pad(features, (0, 512 - len(features)))

    return features
```

### Cambiare Network Architecture
```python
# File: src/agent.py
# Class: QNetwork (circa linea 50)

class QNetwork(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),  # ← Aggiungi layers
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )
```

---

## 🐛 Troubleshooting Veloce

### Problema: Training non converge
```bash
# Soluzioni:
--learning-rate 5e-5      # Riduci LR
--hidden-dim 128          # Riduci network
--batch-size 32           # Riduci batch
--episodes 10000          # Più episodi

# Modifica reward shaping in environment.py
```

### Problema: Out of Memory
```bash
# Soluzioni:
--batch-size 32           # Riduci batch
--hidden-dim 128          # Riduci network
--unitsX 30 --unitsY 30   # Riduci spazio

# In agent.py, riduci buffer_capacity a 50000
```

### Problema: Training troppo lento
```bash
# Soluzioni:
--device cuda             # Usa GPU
--unitsX 30 --unitsY 30   # Spazio più piccolo
--max-steps 30            # Meno step per episodio
--hidden-dim 128          # Network più piccola
```

### Problema: Agent viola constraints
```python
# File: src/environment.py
# Aumenta penalità constraint:
constraint_penalty = 2000  # invece di 1000
```

---

## 📈 Interpretazione Grafici TensorBoard

### Reward/Episode
```
Pattern positivo:    📈 Cresce gradualmente
Pattern negativo:    📉 Decresce o flat
Oscillazioni:        OK se trend positivo
```

### Metrics/Coverage
```
Target:              📈 → 100%
Buono:               > 90% dopo 2000 ep
Problematico:        < 70% dopo 5000 ep
```

### Metrics/CableLength
```
Pattern positivo:    📉 Diminuisce
Stabile:             OK se basso
Crescente:           🔴 Problema
```

### Loss/Training
```
Pattern positivo:    📉 Diminuisce poi stabile
Esplosione:          🔴 LR troppo alto
Flat alto:           🔴 Non sta imparando
```

---

## 💾 File Importanti

### Input
```
requirements.txt          Dipendenze Python
src/*.py                  Codice sorgente
notebooks/*.ipynb         Tutorial interattivi
```

### Output Training
```
models/checkpoints/best_model.pth          Best model
models/checkpoints/episode_*.pth           Checkpoints
models/checkpoints/training_stats.json     Statistiche
logs/dqn_*/events.out.tfevents.*          TensorBoard
```

### Output Evaluation
```
evaluation_results/evaluation_results.json  Metriche
evaluation_results/evaluation_plots.png     Grafici
evaluation_results/comparison_plots.png     Confronto
```

---

## 🎯 Checklist Rapida

### Prima di Training
- [ ] Environment Python attivo: `source venv/bin/activate`
- [ ] Requirements installati: `pip list | grep torch`
- [ ] Test environment OK: `python src/environment.py`
- [ ] Test agent OK: `python src/agent.py`

### Durante Training
- [ ] TensorBoard running: `tensorboard --logdir logs/`
- [ ] Log file monitored: `tail -f training.log`
- [ ] Reward cresce?
- [ ] Coverage → 100%?
- [ ] Loss diminuisce?

### Dopo Training
- [ ] Best model salvato: `ls models/checkpoints/best_model.pth`
- [ ] Evaluation eseguita: `python src/evaluate.py ...`
- [ ] Metriche > target?
- [ ] Confronto con baseline positivo?

---

## 📞 Aiuto Rapido

| Problema | Soluzione |
|----------|-----------|
| Non so da dove iniziare | Leggi `README.md` |
| Errori durante setup | Leggi `GETTING_STARTED.md` |
| Voglio capire architettura | Leggi `ARCHITECTURE.md` |
| Training non converge | Sezione troubleshooting sopra |
| Voglio modificare sistema | Leggi `ARCHITECTURE.md` extension points |

---

## 🔗 Link Veloci

| Documento | Quando leggerlo |
|-----------|----------------|
| [README.md](README.md) | **Prima di tutto** |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Per setup pratico |
| [INDEX.md](INDEX.md) | Per navigazione docs |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Per capire sistema |
| [SUMMARY.md](SUMMARY.md) | Per overview completo |
| [QUICKREF.md](QUICKREF.md) | **Questo file!** |

---

## 💡 Tips Finali

1. **Salva questa pagina** nei preferiti
2. **Inizia sempre piccolo**: 100 episodi prima di 5000
3. **Monitora TensorBoard**: È il tuo migliore amico
4. **Salva esperimenti**: `training_config.txt` con parametri usati
5. **Confronta sempre**: Prima vs dopo modifiche
6. **Pazienza**: RL impiega tempo a convergere

---

**Happy Training! 🚀**

Tieni questa pagina aperta mentre lavori sul progetto!
