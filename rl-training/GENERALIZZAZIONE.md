# 🤔 Generalizzazione del Modello RL - Domanda Cruciale

## ❓ La Domanda

**"Il modello addestrato funziona su configurazioni diverse da quelle viste durante il training?"**

Esempio:
- Training: spazi 50x50x50 con 100 sensori
- Produzione: spazio 80x35x60 con 73 sensori
- **Funziona?** 🤔

---

## ✅ Risposta Breve

**SÌ, il modello generalizza** se fatto correttamente!

Ma serve attenzione nel design dello **state encoding** per renderlo **invariante** rispetto a dimensioni e configurazioni.

---

## 🎯 Come Funziona la Generalizzazione

### 1. **State Encoding Normalizzato** (Già Implementato ✅)

Nel nostro sistema, lo state è **normalizzato**:

```python
# INVECE DI (non generalizza):
features = [
    sensor.x,  # Valore assoluto: 45 metri
    sensor.y,  # Valore assoluto: 30 metri
    sensor.z   # Valore assoluto: 20 metri
]
# ❌ Funziona solo per spazi simili!

# FACCIAMO (generalizza):
features = [
    sensor.x / unitsX,  # Normalizzato: 0.0 - 1.0
    sensor.y / unitsY,  # Normalizzato: 0.0 - 1.0
    sensor.z / unitsZ   # Normalizzato: 0.0 - 1.0
]
# ✅ Funziona per tutti gli spazi!
```

**Perché funziona?**
- L'AI impara **proporzioni relative**, non valori assoluti
- Un sensore a "50% della larghezza" è sempre "50%" sia in 50m che in 100m

---

### 2. **Features Relative** (Già Implementato ✅)

```python
# State encoding nel nostro sistema:

# ✅ Centroide normalizzato (0-1)
centroid = positions.mean() / [unitsX, unitsY, unitsZ]

# ✅ Densità relativa
density = num_sensors / total_volume

# ✅ Coverage ratio (0-1)
coverage = connected_sensors / total_sensors

# ✅ Distanze normalizzate
distance_norm = distance / max_dimension
```

**Risultato**: L'AI impara **pattern spaziali**, non configurazioni specifiche!

---

## 📊 Test di Generalizzazione

### Scenario 1: Dimensioni Diverse

```
TRAINING:
┌────────────────────────────────┐
│ Spazio: 50x50x50               │
│ Sensori: 100                   │
│ Constraints: 10%               │
│                                │
│ 🔴🔴🔴🔴🔴                     │
│ 🔴  ⬛  🔴                     │
│ 🔴🔴  ⬛🔴                      │
└────────────────────────────────┘

PRODUZIONE (Mai visto!):
┌──────────────────────────────────────────┐
│ Spazio: 80x35x60  ← DIVERSO!            │
│ Sensori: 73       ← DIVERSO!            │
│ Constraints: 15%  ← DIVERSO!            │
│                                          │
│ 🔴🔴  🔴                                 │
│   🔴🔴    ⬛⬛                           │
│ 🔴    🔴  ⬛  🔴                         │
└──────────────────────────────────────────┘

❓ FUNZIONA?
```

#### ✅ **SÌ, funziona perché:**

1. **State è normalizzato**: L'AI vede "proporzioni" non "metri"
2. **Action è normalizzato**: Output [0-1] viene scalato a dimensioni reali
3. **Features sono relative**: Densità, coverage, distanze relative

```python
# Durante inference su spazio 80x35x60:

# 1. State normalizzato
state = encode_state(
    sensors=73,
    unitsX=80, unitsY=35, unitsZ=60
)  # → [512 features normalizzate]

# 2. AI decide (in coordinate normalizzate)
action = agent.select_action(state)
# → [0.4, 0.7, 0.3, 1, 12]  # x, y, z, type, ports

# 3. Denormalizzazione
real_x = action[0] * 80  # 0.4 * 80 = 32
real_y = action[1] * 35  # 0.7 * 35 = 24.5
real_z = action[2] * 60  # 0.3 * 60 = 18

# ✅ Funziona per QUALSIASI dimensione!
```

---

## ⚠️ Limiti della Generalizzazione

### Casi Problematici

```
1. SCALE ESTREME
   ────────────────────────────────────────────
   Training:  20-100 unità per dimensione
   Test:      500 unità ← TROPPO DIVERSO

   Problema: Pattern spaziali cambiano scala
   Soluzione: Training su range più ampio


2. NUMERO SENSORI ESTREMO
   ────────────────────────────────────────────
   Training:  10-100 sensori
   Test:      1,000 sensori ← TROPPI

   Problema: Complessità molto diversa
   Soluzione: Curriculum learning (scale up)


3. CONSTRAINTS MOLTO DIVERSI
   ────────────────────────────────────────────
   Training:  Constraints sparsi (5-15%)
   Test:      Constraints densi (40%) ← TROPPI

   Problema: Spazio disponibile molto ridotto
   Soluzione: Training con alta variabilità
```

---

## 🎓 Strategia di Training per Massima Generalizzazione

### Approach Consigliato: **Curriculum Learning**

```python
# training_curriculum.py

FASE 1: SEMPLICE (Episodi 0-1000)
════════════════════════════════════════════════
Dimensioni:    20-40 unità (piccoli)
Sensori:       10-30 (pochi)
Constraints:   5-10% (pochi)

Obiettivo: Impara basi
💡 "Capisce concetto di ottimizzazione"


FASE 2: MEDIO (Episodi 1000-3000)
════════════════════════════════════════════════
Dimensioni:    30-70 unità (medi)
Sensori:       20-80 (medi)
Constraints:   8-15% (medi)

Obiettivo: Affina strategia
💡 "Impara pattern complessi"


FASE 3: DIFFICILE (Episodi 3000-5000)
════════════════════════════════════════════════
Dimensioni:    40-100 unità (grandi)
Sensori:       50-150 (molti)
Constraints:   10-20% (molti)

Obiettivo: Gestisce casi complessi
💡 "Diventa esperto"


FASE 4: ESTREMI (Episodi 5000-7000)
════════════════════════════════════════════════
Dimensioni:    15-120 unità (variabile)
Sensori:       5-200 (variabile)
Constraints:   3-25% (variabile)

Obiettivo: Robustezza
💡 "Gestisce edge cases"
```

### Implementazione

```python
# src/training_curriculum.py

def get_curriculum_config(episode: int):
    """
    Restituisce config training basata su episodio
    per curriculum learning
    """
    if episode < 1000:
        # Fase 1: Facile
        return {
            'unitsX': np.random.randint(20, 40),
            'unitsY': np.random.randint(20, 40),
            'unitsZ': np.random.randint(20, 40),
            'num_sensors': np.random.randint(10, 30),
            'constraint_ratio': np.random.uniform(0.05, 0.10)
        }

    elif episode < 3000:
        # Fase 2: Medio
        return {
            'unitsX': np.random.randint(30, 70),
            'unitsY': np.random.randint(30, 70),
            'unitsZ': np.random.randint(30, 70),
            'num_sensors': np.random.randint(20, 80),
            'constraint_ratio': np.random.uniform(0.08, 0.15)
        }

    elif episode < 5000:
        # Fase 3: Difficile
        return {
            'unitsX': np.random.randint(40, 100),
            'unitsY': np.random.randint(40, 100),
            'unitsZ': np.random.randint(40, 100),
            'num_sensors': np.random.randint(50, 150),
            'constraint_ratio': np.random.uniform(0.10, 0.20)
        }

    else:
        # Fase 4: Estremi (massima variabilità)
        return {
            'unitsX': np.random.randint(15, 120),
            'unitsY': np.random.randint(15, 120),
            'unitsZ': np.random.randint(15, 120),
            'num_sensors': np.random.randint(5, 200),
            'constraint_ratio': np.random.uniform(0.03, 0.25)
        }


# Uso nel training loop
for episode in range(7000):
    config = get_curriculum_config(episode)

    env = SensorOptimizationEnv(
        unitsX=config['unitsX'],
        unitsY=config['unitsY'],
        unitsZ=config['unitsZ'],
        # ... altri parametri
    )

    # Train episode...
```

---

## 📈 Test di Generalizzazione Empirico

### Protocollo di Test

```python
# src/test_generalization.py

def test_generalization():
    """
    Test su configurazioni MAI viste durante training
    """

    # Load trained model
    agent = DQNAgent.load('models/best_model.pth')

    # Test configurations (DIVERSE da training)
    test_configs = [
        # Piccolo
        {'units': (25, 25, 25), 'sensors': 15, 'constraints': 0.05},

        # Grande
        {'units': (90, 90, 90), 'sensors': 120, 'constraints': 0.18},

        # Asimmetrico
        {'units': (100, 30, 50), 'sensors': 60, 'constraints': 0.12},

        # Molti sensori pochi constraint
        {'units': (60, 60, 60), 'sensors': 200, 'constraints': 0.03},

        # Pochi sensori molti constraint
        {'units': (40, 40, 40), 'sensors': 20, 'constraints': 0.25},

        # Estremo rettangolare
        {'units': (120, 20, 40), 'sensors': 80, 'constraints': 0.15},
    ]

    results = []

    for config in test_configs:
        env = SensorOptimizationEnv(
            unitsX=config['units'][0],
            unitsY=config['units'][1],
            unitsZ=config['units'][2],
            # ...
        )

        # Evaluate
        metrics = evaluate_on_config(env, agent, num_episodes=20)

        results.append({
            'config': config,
            'coverage': metrics['coverage'],
            'cable_length': metrics['cable_length'],
            'num_boxes': metrics['num_boxes'],
            'success_rate': metrics['success_rate']
        })

    return results
```

### Risultati Attesi

```
CONFIG: Piccolo (25x25x25, 15 sensori)
─────────────────────────────────────────────────
Coverage:      98.5% ✅
Cable Length:  67.3m  ✅
Num Boxes:     3      ✅
Success:       95%    ✅


CONFIG: Grande (90x90x90, 120 sensori)
─────────────────────────────────────────────────
Coverage:      96.8% ✅
Cable Length:  456.2m ✅
Num Boxes:     14     ✅
Success:       87%    ✅


CONFIG: Asimmetrico (100x30x50, 60 sensori)
─────────────────────────────────────────────────
Coverage:      97.2% ✅
Cable Length:  234.5m ✅
Num Boxes:     8      ✅
Success:       91%    ✅


CONFIG: Estremo rettangolare (120x20x40, 80 sensori)
─────────────────────────────────────────────────────
Coverage:      95.1% ✅
Cable Length:  298.7m ✅
Num Boxes:     10     ✅
Success:       82%    ✅  (limite inferiore accettabile)


MEDIA TUTTI I TEST:
─────────────────────────────────────────────────
Coverage:      96.9% ✅ (target: >95%)
Success Rate:  89.2% ✅ (target: >80%)

✅ GENERALIZZAZIONE: ECCELLENTE
```

---

## 🛡️ Strategia di Fallback per Edge Cases

### Sistema Ibrido

```python
# src/hybrid_optimizer.py

class HybridOptimizer:
    """
    Sistema ibrido: RL + Algoritmo classico
    """

    def __init__(self, rl_agent, fallback_algorithm):
        self.rl_agent = rl_agent
        self.fallback = fallback_algorithm

        # Thresholds per decidere quale usare
        self.confidence_threshold = 0.7

    def optimize(self, config):
        """
        Prova RL, se fuori range usa fallback
        """

        # Check se config è nel range di training
        if self._is_out_of_distribution(config):
            print("⚠️  Config fuori range, uso algoritmo classico")
            return self.fallback.optimize(config)

        # Prova RL
        rl_solution = self.rl_agent.optimize(config)

        # Valida soluzione
        if self._is_valid_solution(rl_solution):
            print("✅ RL solution OK")
            return rl_solution
        else:
            print("⚠️  RL solution problematica, uso fallback")
            return self.fallback.optimize(config)

    def _is_out_of_distribution(self, config):
        """
        Detect se config è troppo diversa da training set
        """
        # Check dimensioni
        if (config.unitsX > 150 or config.unitsX < 10 or
            config.unitsY > 150 or config.unitsY < 10 or
            config.unitsZ > 150 or config.unitsZ < 10):
            return True

        # Check numero sensori
        if config.num_sensors > 250 or config.num_sensors < 3:
            return True

        # Check constraints
        if config.constraint_ratio > 0.3 or config.constraint_ratio < 0.01:
            return True

        return False

    def _is_valid_solution(self, solution):
        """
        Valida che soluzione RL sia buona
        """
        return (
            solution.coverage > 0.90 and
            solution.violations == 0 and
            solution.num_boxes > 0
        )


# Usage in production
optimizer = HybridOptimizer(
    rl_agent=trained_agent,
    fallback_algorithm=current_algorithm
)

result = optimizer.optimize(user_config)
# → Usa RL se possibile, altrimenti fallback
```

---

## 📊 Monitoring in Produzione

### Dashboard Metriche

```python
# Monitoring service

class OptimizationMonitor:
    """
    Monitora performance in produzione
    """

    def log_optimization(self, config, solution, method):
        """
        Log ogni ottimizzazione
        """
        metrics = {
            'timestamp': datetime.now(),
            'method': method,  # 'RL' o 'Fallback'

            # Config
            'space_size': config.volume,
            'num_sensors': config.num_sensors,
            'constraint_ratio': config.constraint_ratio,

            # Results
            'coverage': solution.coverage,
            'cable_length': solution.cable_length,
            'num_boxes': solution.num_boxes,
            'violations': solution.violations,
            'optimization_time_ms': solution.time_ms,

            # Quality
            'success': solution.coverage > 0.95,
            'valid': solution.violations == 0
        }

        # Store to database
        self.db.insert(metrics)

        # Alert se problemi
        if not metrics['valid'] or not metrics['success']:
            self.alert_team(metrics)

    def get_statistics(self, days=7):
        """
        Statistiche ultime N giorni
        """
        data = self.db.query_last_days(days)

        return {
            'total_optimizations': len(data),
            'rl_usage_rate': len([d for d in data if d['method'] == 'RL']) / len(data),
            'avg_coverage': np.mean([d['coverage'] for d in data]),
            'success_rate': len([d for d in data if d['success']]) / len(data),
            'avg_time_ms': np.mean([d['optimization_time_ms'] for d in data])
        }
```

### Dashboard Esempio

```
┌────────────────────────────────────────────────────────┐
│         OPTIMIZATION MONITOR - Last 7 Days             │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Total Optimizations:     1,247                        │
│                                                         │
│  RL Usage:                89.3% ▓▓▓▓▓▓▓▓▓░            │
│  Fallback Usage:          10.7% ▓░░░░░░░░░            │
│                                                         │
│  Average Coverage:        97.2% ✅                     │
│  Success Rate:            94.8% ✅                     │
│  Avg Optimization Time:   87ms  ✅                     │
│                                                         │
│  Out-of-Distribution:     6.2%  (77 cases)            │
│  └─ Handled by fallback:  100%  ✅                     │
│                                                         │
│  Alerts Last Week:        2                            │
│  └─ Low coverage:         1                            │
│  └─ Constraint violation: 1                            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Raccomandazioni Finali

### 1. **Training Strategy**

```bash
# Training con alta variabilità
python src/training.py \
  --algorithm dqn \
  --episodes 7000 \
  --curriculum-learning \
  --dimension-range 15-120 \
  --sensor-range 5-200 \
  --constraint-range 0.03-0.25
```

### 2. **Testing Strategy**

```bash
# Test generalizzazione pre-deploy
python src/test_generalization.py \
  --model models/best_model.pth \
  --num-configs 50 \
  --output generalization_report.json
```

### 3. **Production Strategy**

```python
# Sistema ibrido in produzione
if config_in_training_range:
    use RL  # 90% dei casi
else:
    use Fallback  # 10% edge cases

# + Monitoring continuo
# + Alert se problemi
# + A/B testing
```

---

## 🎯 Risposta Finale alla Domanda

### ❓ "Il modello funziona su configurazioni diverse?"

### ✅ **SÌ, funziona molto bene SE:**

1. ✅ **State è normalizzato** (già fatto)
2. ✅ **Training su range ampio** (da implementare con curriculum learning)
3. ✅ **Sistema ibrido** per edge cases (da implementare)
4. ✅ **Monitoring in produzione** (da implementare)

### 📊 **Range di Generalizzazione Atteso**

```
FUNZIONA ECCELLENTEMENTE (95%+ success):
─────────────────────────────────────────────────
Dimensioni:   20-100 unità per asse
Sensori:      10-150
Constraints:  5-20%
Forme:        Qualsiasi (cubiche, rettangolari, etc.)


FUNZIONA BENE (80-95% success):
─────────────────────────────────────────────────
Dimensioni:   15-120 unità
Sensori:      5-200
Constraints:  3-25%


RICHIEDE FALLBACK (<80% success):
─────────────────────────────────────────────────
Dimensioni:   <10 o >150 unità
Sensori:      <3 o >250
Constraints:  <2% o >30%
```

### 💡 **In Pratica**

Il 90% dei casi reali sarà gestito **perfettamente** dall'AI.

Il restante 10% (edge cases estremi) userà l'**algoritmo classico** come fallback.

**Risultato**: Sistema robusto e affidabile per tutti i casi! ✅

---

**Documento aggiornato**: 4 Novembre 2025
