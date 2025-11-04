# Machine Learning per l'Ottimizzazione del Posizionamento Sensori 3D

## Panoramica

L'ottimizzazione del posizionamento di sensori e junction boxes in uno spazio 3D con vincoli (constraints) è un problema perfetto per l'applicazione di tecniche di Machine Learning. Questo documento esplora diversi approcci ML applicabili al sistema di ottimizzazione sensori.

---

## 1. Reinforcement Learning (RL) - APPROCCIO PIÙ PROMETTENTE

### Perché è ideale

Il problema è intrinsecamente **sequenziale** (posiziona un junction box alla volta) con **ricompense chiare e misurabili** (minimizza lunghezza cavi, massimizza connessioni, rispetta constraints).

### Algoritmi Specifici

#### Deep Q-Network (DQN)
- **Funzionamento**: L'agente impara una funzione Q che stima il valore di ogni azione in ogni stato
- **Applicazione**: Predice il miglior posizionamento per ogni junction box
- **Vantaggi**: Robusto, ben testato, funziona bene con spazi d'azione discreti

#### Proximal Policy Optimization (PPO)
- **Funzionamento**: Ottimizza direttamente la policy con aggiornamenti graduali e sicuri
- **Applicazione**: Ideale per spazi d'azione continui (coordinate x,y,z)
- **Vantaggi**: Stabile, sample-efficient, state-of-the-art per problemi continui

#### A3C (Asynchronous Actor-Critic)
- **Funzionamento**: Multiple agenti in parallelo che condividono conoscenza
- **Applicazione**: Training veloce con esplorazione parallela
- **Vantaggi**: Riduce tempo di training, migliora esplorazione

### Definizione del Problema RL

```typescript
// State (Stato dell'ambiente)
interface State {
  sensorPositions: Array<{x: number, y: number, z: number, type: number}>;
  constraints: Array<{x: number, y: number, z: number}>;
  placedBoxes: Array<{x: number, y: number, z: number, type: number, ports: number}>;
  unconnectedSensors: number;
  spaceVolume: {x: number, y: number, z: number};
}

// Action (Azione dell'agente)
interface Action {
  x: number;        // Coordinata X del nuovo junction box
  y: number;        // Coordinata Y
  z: number;        // Coordinata Z
  sensorType: number; // Tipo di sensore da connettere
  ports: number;    // Numero di porte
}

// Reward (Ricompensa)
function calculateReward(state: State, action: Action): number {
  const cableLengthPenalty = -totalCableLength * 0.5;
  const coverageReward = connectedSensors * 100;
  const boxCountPenalty = -numberOfBoxes * 10;
  const constraintViolation = violatesConstraint ? -1000 : 0;

  return cableLengthPenalty + coverageReward + boxCountPenalty + constraintViolation;
}
```

### Implementazione Pratica

```typescript
class SensorOptimizationRLAgent {
  private model: tf.LayersModel;
  private epsilon: number = 0.1; // Exploration rate

  constructor() {
    // Neural network per approssimare Q-function
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({units: 256, activation: 'relu', inputShape: [stateSize]}),
        tf.layers.dropout({rate: 0.2}),
        tf.layers.dense({units: 128, activation: 'relu'}),
        tf.layers.dropout({rate: 0.2}),
        tf.layers.dense({units: actionSize, activation: 'linear'})
      ]
    });
  }

  getState(sensors: Sensor[], boxes: JunctionBox[], constraints: Constraint[]): number[] {
    // Encode current state as feature vector
    return [
      ...this.encodeSensorDistribution(sensors),
      ...this.encodeBoxPositions(boxes),
      ...this.encodeConstraints(constraints),
      this.calculateUnconnectedRatio(sensors, boxes)
    ];
  }

  async selectAction(state: number[]): Promise<Action> {
    // Epsilon-greedy exploration
    if (Math.random() < this.epsilon) {
      return this.randomAction();
    }

    const qValues = this.model.predict(tf.tensor2d([state])) as tf.Tensor;
    const actionIndex = (await qValues.argMax(-1).data())[0];
    return this.decodeAction(actionIndex);
  }

  async train(batch: Experience[]) {
    const states = batch.map(e => e.state);
    const actions = batch.map(e => e.action);
    const rewards = batch.map(e => e.reward);
    const nextStates = batch.map(e => e.nextState);

    // Bellman equation: Q(s,a) = r + γ * max(Q(s',a'))
    const targetQValues = await this.calculateTargetQValues(
      rewards,
      nextStates,
      gamma=0.99
    );

    await this.model.fit(
      tf.tensor2d(states),
      tf.tensor2d(targetQValues),
      {epochs: 1, verbose: 0}
    );
  }
}
```

---

## 2. K-means Clustering + Supervised Learning

### Approccio Ibrido

Combina clustering non supervisionato con apprendimento supervisionato per predire configurazioni ottimali.

### Pipeline

```typescript
// Step 1: Clustering dei sensori
function clusterSensors(sensors: Sensor[], k: number): Cluster[] {
  // K-means per identificare gruppi naturali di sensori
  const kmeans = new KMeans(k);
  return kmeans.fit(sensors.map(s => [s.x, s.y, s.z]));
}

// Step 2: Feature Engineering
function extractFeatures(config: Configuration): Features {
  return {
    // Statistiche distribuzione sensori
    sensorDensity: calculateDensity(config.sensors),
    clusterCentroids: calculateCentroids(config.sensors),
    avgDistanceBetweenSensors: calculateAvgDistance(config.sensors),

    // Informazioni constraints
    constraintDensity: config.constraints.length / config.volume,
    constraintClustering: analyzeConstraintClustering(config.constraints),

    // Caratteristiche spazio
    spaceVolume: config.unitsX * config.unitsY * config.unitsZ,
    spaceAspectRatio: [config.unitsX, config.unitsY, config.unitsZ],

    // Informazioni sensori per tipo
    sensorsPerType: groupByType(config.sensors)
  };
}

// Step 3: Training del modello supervisionato
class OptimalConfigurationPredictor {
  private model: tf.LayersModel;

  async train(dataset: TrainingData[]) {
    // Dataset: (features, optimal_boxes)
    // optimal_boxes generato dall'ottimizzatore algoritmico attuale

    const X = dataset.map(d => d.features);
    const Y = dataset.map(d => d.optimalBoxes);

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({units: 512, activation: 'relu', inputShape: [featureSize]}),
        tf.layers.batchNormalization(),
        tf.layers.dropout({rate: 0.3}),
        tf.layers.dense({units: 256, activation: 'relu'}),
        tf.layers.batchNormalization(),
        tf.layers.dropout({rate: 0.3}),
        tf.layers.dense({units: outputSize, activation: 'linear'})
      ]
    });

    await this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    await this.model.fit(tf.tensor2d(X), tf.tensor2d(Y), {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2
    });
  }

  async predict(config: Configuration): Promise<JunctionBox[]> {
    const features = extractFeatures(config);
    const prediction = this.model.predict(tf.tensor2d([features])) as tf.Tensor;
    return this.decodeBoxes(await prediction.data());
  }
}
```

### Generazione Dataset

```typescript
async function generateTrainingDataset(numSamples: number): Promise<TrainingData[]> {
  const dataset: TrainingData[] = [];

  for (let i = 0; i < numSamples; i++) {
    // Genera configurazione random
    const config = generateRandomConfiguration();

    // Usa ottimizzatore attuale come "ground truth"
    const optimalBoxes = await algorithmicOptimizer.optimize(config);

    // Estrai features
    const features = extractFeatures(config);

    dataset.push({
      features,
      optimalBoxes: encodeBoxes(optimalBoxes)
    });

    if (i % 100 === 0) {
      console.log(`Generated ${i}/${numSamples} samples`);
    }
  }

  return dataset;
}
```

---

## 3. Graph Neural Networks (GNN)

### Rappresentazione come Grafo

Il problema può essere naturalmente rappresentato come un grafo:

```typescript
interface SensorGraph {
  nodes: Array<{
    id: string;
    type: 'sensor' | 'junctionBox' | 'constraint';
    position: {x: number, y: number, z: number};
    features: number[]; // embedding del nodo
  }>;

  edges: Array<{
    source: string;
    target: string;
    weight: number; // distanza euclidea
    type: 'potential_connection' | 'constraint_proximity';
  }>;
}
```

### Architettura GNN

```typescript
class SensorOptimizationGNN {
  private graphConvLayers: tf.LayersModel[];

  constructor() {
    // Message Passing Neural Network
    this.graphConvLayers = [
      this.createGraphConvLayer(64),
      this.createGraphConvLayer(128),
      this.createGraphConvLayer(256)
    ];
  }

  createGraphConvLayer(units: number) {
    // Graph Convolution: agrega informazioni dai nodi vicini
    return tf.sequential({
      layers: [
        tf.layers.dense({units, activation: 'relu'}),
        tf.layers.batchNormalization()
      ]
    });
  }

  async forward(graph: SensorGraph): Promise<JunctionBox[]> {
    let nodeEmbeddings = this.initializeNodeFeatures(graph.nodes);

    // Message passing per 3 layers
    for (const layer of this.graphConvLayers) {
      nodeEmbeddings = await this.messagePass(
        nodeEmbeddings,
        graph.edges,
        layer
      );
    }

    // Predici posizioni junction boxes da embeddings
    return this.decodeJunctionBoxes(nodeEmbeddings);
  }

  async messagePass(
    nodeFeatures: tf.Tensor,
    edges: Edge[],
    layer: tf.LayersModel
  ): Promise<tf.Tensor> {
    // Per ogni nodo, aggrega features dai vicini
    const messages = edges.map(edge => {
      const sourceFeatures = nodeFeatures.gather([edge.source]);
      const targetFeatures = nodeFeatures.gather([edge.target]);
      return layer.predict(
        tf.concat([sourceFeatures, targetFeatures], -1)
      ) as tf.Tensor;
    });

    // Aggrega tutti i messaggi per nodo
    return this.aggregateMessages(messages, edges);
  }
}
```

### Vantaggi GNN

- **Relazioni spaziali**: Cattura naturalmente le relazioni tra sensori vicini
- **Invarianza**: Funziona indipendentemente dall'ordine dei sensori
- **Scalabilità**: Gestisce efficacemente configurazioni di diverse dimensioni
- **Constraints**: Può incorporare constraints come nodi speciali nel grafo

---

## 4. Genetic Algorithms / Evolutionary Strategies

Non proprio ML, ma molto efficace per ottimizzazione combinatoria.

### Rappresentazione Cromosoma

```typescript
interface Chromosome {
  genes: JunctionBox[]; // Lista di junction boxes
  fitness: number;      // Valutazione soluzione
}

class GeneticOptimizer {
  private populationSize = 100;
  private mutationRate = 0.1;
  private crossoverRate = 0.7;

  // Fitness function
  calculateFitness(chromosome: Chromosome, config: Configuration): number {
    const totalCableLength = this.calculateTotalCable(chromosome.genes, config.sensors);
    const coverage = this.calculateCoverage(chromosome.genes, config.sensors);
    const constraintViolations = this.countViolations(chromosome.genes, config.constraints);

    return (
      coverage * 1000 -              // Massimizza coverage
      totalCableLength * 0.5 -       // Minimizza cavi
      chromosome.genes.length * 10 - // Minimizza numero boxes
      constraintViolations * 10000   // Penalizza violazioni
    );
  }

  // Crossover (breeding)
  crossover(parent1: Chromosome, parent2: Chromosome): Chromosome[] {
    if (Math.random() > this.crossoverRate) {
      return [parent1, parent2];
    }

    const cutPoint = Math.floor(Math.random() * parent1.genes.length);

    return [
      {
        genes: [...parent1.genes.slice(0, cutPoint), ...parent2.genes.slice(cutPoint)],
        fitness: 0
      },
      {
        genes: [...parent2.genes.slice(0, cutPoint), ...parent1.genes.slice(cutPoint)],
        fitness: 0
      }
    ];
  }

  // Mutation
  mutate(chromosome: Chromosome, config: Configuration): Chromosome {
    const mutated = {...chromosome, genes: [...chromosome.genes]};

    for (let i = 0; i < mutated.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        // Muta posizione
        mutated.genes[i] = {
          ...mutated.genes[i],
          x: mutated.genes[i].x + (Math.random() - 0.5) * 10,
          y: mutated.genes[i].y + (Math.random() - 0.5) * 10,
          z: mutated.genes[i].z + (Math.random() - 0.5) * 10
        };

        // Assicura bounds
        mutated.genes[i].x = Math.max(0, Math.min(config.unitsX, mutated.genes[i].x));
        mutated.genes[i].y = Math.max(0, Math.min(config.unitsY, mutated.genes[i].y));
        mutated.genes[i].z = Math.max(0, Math.min(config.unitsZ, mutated.genes[i].z));
      }
    }

    return mutated;
  }

  // Main evolution loop
  async evolve(config: Configuration, generations: number): Promise<JunctionBox[]> {
    let population = this.initializePopulation(config);

    for (let gen = 0; gen < generations; gen++) {
      // Calcola fitness
      population.forEach(chromosome => {
        chromosome.fitness = this.calculateFitness(chromosome, config);
      });

      // Selection
      population.sort((a, b) => b.fitness - a.fitness);
      const selected = population.slice(0, this.populationSize / 2);

      // Crossover
      const offspring: Chromosome[] = [];
      while (offspring.length < this.populationSize / 2) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        offspring.push(...this.crossover(parent1, parent2));
      }

      // Mutation
      const mutated = offspring.map(child => this.mutate(child, config));

      // New generation
      population = [...selected, ...mutated];

      if (gen % 10 === 0) {
        console.log(`Generation ${gen}: Best fitness = ${population[0].fitness}`);
      }
    }

    return population[0].genes;
  }
}
```

---

## 5. Neural Combinatorial Optimization

Usa architetture tipo **Pointer Networks** o **Attention mechanisms**.

### Pointer Network

```typescript
class PointerNetwork {
  private encoder: tf.LayersModel;
  private decoder: tf.LayersModel;
  private attention: AttentionLayer;

  constructor() {
    // Encoder: LSTM che processa sensori in input
    this.encoder = tf.sequential({
      layers: [
        tf.layers.lstm({units: 256, returnSequences: true}),
        tf.layers.lstm({units: 256})
      ]
    });

    // Attention mechanism
    this.attention = new AttentionLayer(256);

    // Decoder: genera sequenza di junction boxes
    this.decoder = tf.sequential({
      layers: [
        tf.layers.lstm({units: 256, returnSequences: true})
      ]
    });
  }

  async forward(sensors: Sensor[]): Promise<JunctionBox[]> {
    // Encode input sensors
    const encoderOutput = this.encoder.predict(
      tf.tensor3d([sensors.map(s => [s.x, s.y, s.z, s.type])])
    ) as tf.Tensor;

    const boxes: JunctionBox[] = [];
    let decoderState = encoderOutput;

    // Autoregressive decoding: genera un box alla volta
    for (let i = 0; i < maxBoxes; i++) {
      // Attention sui sensori
      const context = await this.attention.apply(decoderState, encoderOutput);

      // Decoder step
      const output = this.decoder.predict([decoderState, context]) as tf.Tensor;

      // Pointer: scegli dove piazzare prossimo box
      const boxPosition = await this.decodePosition(output);

      boxes.push(boxPosition);
      decoderState = output;

      // Stop se tutti i sensori sono coperti
      if (this.allSensorsCovered(boxes, sensors)) break;
    }

    return boxes;
  }
}

class AttentionLayer {
  private Wq: tf.Tensor; // Query weights
  private Wk: tf.Tensor; // Key weights
  private Wv: tf.Tensor; // Value weights

  constructor(dim: number) {
    this.Wq = tf.variable(tf.randomNormal([dim, dim]));
    this.Wk = tf.variable(tf.randomNormal([dim, dim]));
    this.Wv = tf.variable(tf.randomNormal([dim, dim]));
  }

  async apply(query: tf.Tensor, keys: tf.Tensor): Promise<tf.Tensor> {
    // Scaled dot-product attention
    const Q = tf.matMul(query, this.Wq);
    const K = tf.matMul(keys, this.Wk);
    const V = tf.matMul(keys, this.Wv);

    const scores = tf.matMul(Q, K.transpose());
    const scaledScores = tf.div(scores, Math.sqrt(Q.shape[1]));
    const weights = tf.softmax(scaledScores);

    return tf.matMul(weights, V);
  }
}
```

---

## Confronto Approcci

| Approccio | Complessità | Sample Efficiency | Generalizzazione | Interpretabilità |
|-----------|-------------|-------------------|------------------|------------------|
| **RL (PPO)** | Alta | Media | Ottima | Bassa |
| **K-means + Supervised** | Media | Alta | Buona | Media |
| **GNN** | Alta | Media | Ottima | Bassa |
| **Genetic Algorithms** | Media | Bassa | Media | Alta |
| **Pointer Networks** | Molto Alta | Bassa | Ottima | Bassa |

---

## Implementazione Consigliata: Approccio Ibrido

### Quick Win - Imitation Learning (1-2 settimane)

```typescript
// 1. Genera dataset dall'ottimizzatore attuale
async function collectTrainingData(numSamples: number) {
  const dataset = [];

  for (let i = 0; i < numSamples; i++) {
    const config = generateRandomConfiguration();

    // Auto-connect + algorithmic optimizer = ground truth
    await autoConnect(config);
    const optimized = await algorithmicOptimizer(config);

    dataset.push({
      input: extractFeatures(config),
      output: encodeBoxes(optimized.boxes)
    });
  }

  await saveDataset(dataset, 'training_data.json');
}

// 2. Training modello supervisionato
const model = new SupervisedOptimizer();
await model.train(dataset, {
  epochs: 100,
  batchSize: 32,
  learningRate: 0.001
});

// 3. Export per uso in produzione
await model.save('models/sensor_optimizer_v1');
```

### Long Term - Reinforcement Learning (2-3 mesi)

```typescript
// 1. Environment Gym-like
class SensorOptimizationEnv {
  reset(): State {
    // Genera nuova configurazione random
    return this.generateRandomState();
  }

  step(action: Action): {state: State, reward: number, done: boolean} {
    // Applica azione
    this.placeJunctionBox(action);

    // Calcola reward
    const reward = this.calculateReward();

    // Check se episodio è finito
    const done = this.allSensorsConnected() || this.maxStepsReached();

    return {
      state: this.getState(),
      reward,
      done
    };
  }
}

// 2. Training con PPO
const env = new SensorOptimizationEnv();
const agent = new PPOAgent({
  stateDim: 512,
  actionDim: 128,
  hiddenLayers: [256, 256]
});

// Training loop
for (let episode = 0; episode < 10000; episode++) {
  let state = env.reset();
  let episodeReward = 0;

  while (true) {
    const action = await agent.selectAction(state);
    const {state: nextState, reward, done} = env.step(action);

    agent.storeTransition(state, action, reward, nextState, done);
    episodeReward += reward;

    if (done) break;
    state = nextState;
  }

  // Update policy ogni N episodi
  if (episode % 10 === 0) {
    await agent.update();
    console.log(`Episode ${episode}: Reward = ${episodeReward}`);
  }
}

// 3. Export modello addestrato
await agent.save('models/rl_optimizer_ppo');
```

---

## Vantaggi ML per questo Problema

1. **Gestione Constraints Complessi**: ML impara pattern complessi di constraints meglio degli algoritmi euristici

2. **Generalizzazione**: Un modello ben addestrato funziona su configurazioni mai viste

3. **Velocità**: Inferenza ML (forward pass) è molto veloce (~10-50ms) vs ricerca esaustiva

4. **Miglioramento Continuo**: Il modello può essere riaddestrato con nuovi dati per migliorare

5. **Multi-Obiettivo**: ML gestisce naturalmente ottimizzazione multi-obiettivo (cavi, boxes, coverage)

---

## Metriche di Valutazione

```typescript
interface OptimizationMetrics {
  // Performance
  totalCableLength: number;
  numberOfJunctionBoxes: number;
  coveragePercentage: number;

  // Validità
  constraintViolations: number;
  unconnectedSensors: number;

  // Efficienza
  optimizationTimeMs: number;

  // Confronto con baseline
  improvementVsAlgorithmic: number; // percentuale
  improvementVsRandom: number;
}

function evaluateOptimizer(
  optimizer: Optimizer,
  testSet: Configuration[]
): OptimizationMetrics {
  const results = testSet.map(config => {
    const startTime = Date.now();
    const solution = optimizer.optimize(config);
    const timeMs = Date.now() - startTime;

    return {
      config,
      solution,
      timeMs,
      metrics: calculateMetrics(solution, config)
    };
  });

  return aggregateResults(results);
}
```

---

## Next Steps

### Fase 1: Proof of Concept (1-2 settimane)
1. Implementare data collection dall'ottimizzatore attuale
2. Generare dataset di 10,000+ configurazioni
3. Training modello supervised learning semplice
4. Benchmarking vs ottimizzatore algoritmico

### Fase 2: Produzione (3-4 settimane)
1. Ottimizzazione architettura modello
2. Hyperparameter tuning
3. Integrazione nel sistema esistente
4. A/B testing con utenti

### Fase 3: RL Advanced (2-3 mesi)
1. Implementare environment RL completo
2. Training agent PPO/SAC
3. Fine-tuning con real user feedback
4. Deploy come opzione "ML Optimizer" nell'UI

---

## Risorse e Librerie

### TensorFlow.js
```bash
npm install @tensorflow/tfjs
```

### RL Framework
```bash
npm install @tensorflow/tfjs-node
npm install rl-js  # Reinforcement Learning library
```

### Esempio Minimal

```typescript
import * as tf from '@tensorflow/tfjs';

// Simple neural network optimizer
const model = tf.sequential({
  layers: [
    tf.layers.dense({units: 128, activation: 'relu', inputShape: [featureSize]}),
    tf.layers.dropout({rate: 0.2}),
    tf.layers.dense({units: 64, activation: 'relu'}),
    tf.layers.dense({units: outputSize, activation: 'linear'})
  ]
});

model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'meanSquaredError'
});

// Training
await model.fit(X_train, Y_train, {
  epochs: 50,
  batchSize: 32,
  validationSplit: 0.2,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
    }
  }
});

// Inference
const prediction = model.predict(X_test) as tf.Tensor;
const boxes = decodeJunctionBoxes(await prediction.data());
```

---

## Conclusioni

Il Machine Learning offre enormi potenzialità per migliorare l'ottimizzazione del posizionamento sensori. L'approccio più pragmatico è:

1. **Iniziare con Imitation Learning** per quick wins
2. **Raccogliere dati reali** dall'uso del sistema
3. **Implementare RL** per ottimizzazione avanzata nel lungo termine

Il sistema attuale (algoritmo + AI) può servire come **teacher** per generare training data di alta qualità, accelerando significativamente lo sviluppo del modello ML.
