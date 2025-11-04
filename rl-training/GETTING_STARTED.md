# Getting Started - RL Training per Sensor Optimization

Guida rapida per iniziare con il training del sistema RL.

## Setup Veloce (5 minuti)

### 1. Installa Dipendenze

```bash
cd rl-training
python3 -m venv venv
source venv/bin/activate  # su macOS/Linux
# oppure su Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Test Environment

```bash
# Test che environment funzioni correttamente
python src/environment.py
```

Output atteso:
```
Testing Sensor Optimization Environment...
Initial observation shape: (512,)
Initial info: {'num_sensors': 33, ...}
...
Environment test completed!
```

### 3. Test Agent

```bash
# Test che agent funzioni
python src/agent.py
```

Output atteso:
```
Testing DQN Agent...
Agent created on device: cpu
State shape: (512,)
Action shape: (5,)
...
Agent test completed!
```

## Prima Esecuzione Training (30 minuti)

### Opzione A: Training Veloce (Test)

```bash
# Training veloce per testare (100 episodi, ~5 minuti)
python src/training.py \
  --algorithm dqn \
  --episodes 100 \
  --max-steps 20 \
  --eval-interval 20 \
  --save-interval 50
```

### Opzione B: Training Completo

```bash
# Training completo (5000 episodi, ~2-3 ore su CPU)
python src/training.py \
  --algorithm dqn \
  --episodes 5000 \
  --max-steps 50 \
  --eval-interval 100 \
  --save-interval 200 \
  --log-dir logs/ \
  --checkpoint-dir models/checkpoints/
```

### Opzione C: Training con GPU (più veloce)

```bash
# Se hai GPU CUDA disponibile
python src/training.py \
  --algorithm dqn \
  --episodes 5000 \
  --device cuda
```

## Monitoraggio Training

### TensorBoard

In una nuova finestra terminale:

```bash
cd rl-training
source venv/bin/activate
tensorboard --logdir logs/
```

Poi apri browser su: http://localhost:6006

Vedrai in tempo reale:
- Reward per episodio
- Coverage
- Cable length
- Numero junction boxes
- Loss function

## Evaluation

Dopo il training, valuta il modello:

```bash
python src/evaluate.py \
  --model-path models/checkpoints/best_model.pth \
  --algorithm dqn \
  --num-episodes 100 \
  --compare-baseline \
  --output-dir evaluation_results/
```

Questo genererà:
- `evaluation_results/evaluation_results.json` - Metriche dettagliate
- `evaluation_results/evaluation_plots.png` - Grafici distribuzione
- `evaluation_results/comparison_plots.png` - Confronto con baseline

## Jupyter Notebook (Interattivo)

Per esperimenti interattivi:

```bash
cd rl-training
jupyter notebook notebooks/01_quick_start.ipynb
```

Il notebook include:
- Test environment
- Test agent
- Mini training loop (50 episodi)
- Visualizzazioni

## Parametri Comuni

### Environment Parameters

```bash
--unitsX 50           # Dimensione X dello spazio
--unitsY 50           # Dimensione Y
--unitsZ 50           # Dimensione Z
--constraint-ratio 0.1  # % volume occupata da constraints (0-1)
```

### Agent Parameters

```bash
--algorithm dqn       # Algoritmo: 'dqn' o 'ac' (actor-critic)
--hidden-dim 256      # Dimensione hidden layers
--learning-rate 1e-4  # Learning rate
--gamma 0.99          # Discount factor
--batch-size 64       # Batch size per training
```

### Training Parameters

```bash
--episodes 5000       # Numero episodi training
--max-steps 50        # Max step per episodio
--save-interval 100   # Salva checkpoint ogni N episodi
--eval-interval 50    # Evaluation ogni N episodi
```

## Troubleshooting

### Problema: Agent non converge

**Sintomi**: Reward resta basso, coverage non migliora

**Soluzioni**:
1. Riduci learning rate: `--learning-rate 5e-5`
2. Aumenta exploration: modifica epsilon_decay in agent.py
3. Modifica reward shaping in environment.py

### Problema: Training troppo lento

**Soluzioni**:
1. Riduci dimensione spazio: `--unitsX 30 --unitsY 30 --unitsZ 30`
2. Riduci numero episodi per test: `--episodes 1000`
3. Usa GPU: `--device cuda`
4. Riduci hidden-dim: `--hidden-dim 128`

### Problema: Agent viola constraints

**Soluzioni**:
1. Aumenta penalità in `environment.py`:
   ```python
   constraint_penalty = 2000  # invece di 1000
   ```
2. Aggiungi constraint penalty allo state encoding

### Problema: Out of Memory

**Soluzioni**:
1. Riduci batch size: `--batch-size 32`
2. Riduci buffer capacity in agent.py
3. Riduci dimensione network: `--hidden-dim 128`

## Next Steps

Dopo il primo training riuscito:

### 1. Hyperparameter Tuning

Prova diverse combinazioni:

```bash
# Learning rate
for lr in 1e-3 1e-4 1e-5; do
  python src/training.py --learning-rate $lr --episodes 1000
done

# Hidden dimension
for hd in 128 256 512; do
  python src/training.py --hidden-dim $hd --episodes 1000
done
```

### 2. Curriculum Learning

Inizia con configurazioni semplici, poi aumenta complessità:

```bash
# Fase 1: Spazio piccolo
python src/training.py --unitsX 20 --unitsY 20 --unitsZ 20 --episodes 2000

# Fase 2: Spazio medio (load modello fase 1)
python src/training.py --unitsX 40 --unitsY 40 --unitsZ 40 --episodes 2000

# Fase 3: Spazio grande
python src/training.py --unitsX 60 --unitsY 60 --unitsZ 60 --episodes 2000
```

### 3. Alternative Algorithms

Prova Actor-Critic se DQN non converge:

```bash
python src/training.py --algorithm ac --episodes 5000
```

### 4. Data Collection

Raccogli dati dall'ottimizzatore attuale per supervised learning:

```python
# TODO: Implementare data_collector.py
# che usa l'ottimizzatore algoritmico in SensorVisualization.tsx
```

## Best Practices

1. **Sempre valutare su test set separato**: Non usare training episodes per evaluation

2. **Salva checkpoint frequentemente**: Può crashare durante training lungo

3. **Monitora TensorBoard**: Controlla che metriche migliorino

4. **Confronta con baseline**: Sempre valutare improvement vs random

5. **Versioning modelli**: Salva con timestamp e hyperparameters
   ```
   models/dqn_lr1e-4_hd256_20241104_143000.pth
   ```

6. **Documentare esperimenti**: Tieni log di cosa funziona e cosa no

## Risorse

- **TensorFlow.js**: Per export modello nel browser
- **Stable Baselines3**: Pre-implemented RL algorithms (alternativa)
- **Ray RLlib**: Per distributed training (scale up)
- **Weights & Biases**: Per tracking esperimenti professionali

## Contatti e Support

Per problemi o domande:
1. Controlla `IMPLEMENTATION_PLAN.md` per dettagli tecnici
2. Leggi `README.md` per overview generale
3. Consulta Jupyter notebook per esempi interattivi

## Timeline Realistica

- **Setup e test**: 1 ora
- **Primo training (100 ep)**: 10 minuti
- **Training completo (5000 ep)**: 2-4 ore (CPU) / 30-60 min (GPU)
- **Hyperparameter tuning**: 1-2 giorni
- **Production-ready model**: 1 settimana

## Success Metrics

Un modello è "pronto" quando:
- ✅ Coverage > 95% in media
- ✅ Cable length < 1.5x baseline algoritmico
- ✅ Num boxes < baseline algoritmico
- ✅ Constraint violations = 0
- ✅ Success rate > 80%

Buon training! 🚀
