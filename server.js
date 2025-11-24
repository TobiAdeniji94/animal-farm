const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const Bird = require('./models/Bird');
const Dog = require('./models/Dog');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// Load Swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');

// Middleware
app.use(express.json());
app.use(requestLogger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// memory storage for animals
const farm = new Map();

// helper function that gets animal by name
const getAnimal = (name) => {
  const animal = farm.get(name);
  if (!animal) {
    throw new Error(`Animal '${name}' not found on the farm.`);
  }
  return animal;
};

// === ROUTES ====
// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = Date.now() - startTime;
  res.json({
    status: 'healthy',
    uptime: `${Math.floor(uptime / 1000)}s`,
    timestamp: new Date().toISOString(),
    animalsCount: farm.size
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const animals = Array.from(farm.values());
  const metrics = {
    totalAnimals: farm.size,
    birds: animals.filter(a => a.constructor.name === 'Bird').length,
    dogs: animals.filter(a => a.constructor.name === 'Dog').length,
    hungryAnimals: animals.filter(a => a.isHungry).length,
    sleepyAnimals: animals.filter(a => a.isSleepy).length,
    animalsWithDuties: animals.filter(a => a.currentDuty).length,
    animalsWithActions: animals.filter(a => a.currentAction).length
  };
  res.json(metrics);
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Animal Farm API!',
    endpoints: {
      'GET /animals': 'List all animals',
      'POST /animals/bird': 'Create a new bird',
      'POST /animals/dog': 'Create a new dog',
      'GET /animals/:name': 'Get animal details',
      'DELETE /animals/:name': 'Remove animal from farm',
      'POST /animals/:name/eat': 'Make animal eat',
      'POST /animals/:name/sleep': 'Make animal sleep',
      'PUT /animals/:name/hungry': 'Set hungry state',
      'PUT /animals/:name/sleepy': 'Set sleepy state',
      'PUT /animals/:name/duty': 'Set animal duty',
      'POST /animals/:name/perform-duty': 'Perform duty',
      'PUT /animals/:name/action': 'Set animal action',
      'POST /animals/:name/perform-action': 'Perform action'
    }
  });
});

// Get all animals
app.get('/animals', (req, res) => {
  const animals = Array.from(farm.values()).map(animal => animal.getStatus());
  res.json({
    count: animals.length,
    animals
  });
});

// Create a new bird
app.post('/animals/bird', (req, res) => {
  try {
    const { name, canFly, canCrow } = req.body;
    
    if (!name) {
      logger.warn('Bird creation failed: name is required');
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (farm.has(name)) {
      logger.warn(`Bird creation failed: animal '${name}' already exists`);
      return res.status(400).json({ error: `Animal '${name}' already exists` });
    }
    
    const bird = new Bird(name, canFly, canCrow);
    farm.set(name, bird);
    
    logger.info(`Bird created: ${name}`, { canFly, canCrow });
    
    res.status(201).json({
      message: `Bird '${name}' created successfully!`,
      animal: bird.getStatus()
    });
  } catch (error) {
    logger.error('Error creating bird', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

// Create a new dog
app.post('/animals/dog', (req, res) => {
  try {
    const { name, canBark, canChase } = req.body;
    
    if (!name) {
      logger.warn('Dog creation failed: name is required');
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (farm.has(name)) {
      logger.warn(`Dog creation failed: animal '${name}' already exists`);
      return res.status(400).json({ error: `Animal '${name}' already exists` });
    }
    
    const dog = new Dog(name, canBark, canChase);
    farm.set(name, dog);
    
    logger.info(`Dog created: ${name}`, { canBark, canChase });
    
    res.status(201).json({
      message: `Dog '${name}' created successfully!`,
      animal: dog.getStatus()
    });
  } catch (error) {
    logger.error('Error creating dog', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

// Get specific animal
app.get('/animals/:name', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    res.json(animal.getStatus());
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete animal
app.delete('/animals/:name', (req, res) => {
  try {
    const name = req.params.name;
    if (!farm.has(name)) {
      return res.status(404).json({ error: `Animal '${name}' not found` });
    }
    
    farm.delete(name);
    res.json({ message: `${name} has been removed from the farm.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make animal eat
app.post('/animals/:name/eat', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const message = animal.eat();
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Make animal sleep
app.post('/animals/:name/sleep', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const message = animal.sleep();
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Set hungry state
app.put('/animals/:name/hungry', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const { hungry } = req.body;
    
    if (typeof hungry !== 'boolean') {
      return res.status(400).json({ error: 'hungry must be a boolean value' });
    }
    
    const message = animal.setHungry(hungry);
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Set sleepy state
app.put('/animals/:name/sleepy', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const { sleepy } = req.body;
    
    if (typeof sleepy !== 'boolean') {
      return res.status(400).json({ error: 'sleepy must be a boolean value' });
    }
    
    const message = animal.setSleepy(sleepy);
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Set duty
app.put('/animals/:name/duty', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const { duty } = req.body;
    
    if (!duty) {
      return res.status(400).json({ error: 'duty is required' });
    }
    
    const message = animal.setDuty(duty);
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Perform duty
app.post('/animals/:name/perform-duty', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const message = animal.performDuty();
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set action (runtime update capability)
app.put('/animals/:name/action', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }
    
    const message = animal.setAction(action);
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Perform action
app.post('/animals/:name/perform-action', (req, res) => {
  try {
    const animal = getAnimal(req.params.name);
    const message = animal.performAction();
    res.json({ message, status: animal.getStatus() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Animal Farm API started on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Metrics available at http://localhost:${PORT}/metrics`);
  logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  console.log(`🚀 Animal Farm API is running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
});
