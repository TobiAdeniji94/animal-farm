const request = require('supertest');
const express = require('express');
const Bird = require('../models/Bird');
const Dog = require('../models/Dog');

// Mock the server setup
let app;
let farm;

beforeEach(() => {
  // Reset the app and farm for each test
  app = express();
  app.use(express.json());
  farm = new Map();
  
  // Helper function
  const getAnimal = (name) => {
    const animal = farm.get(name);
    if (!animal) {
      throw new Error(`Animal '${name}' not found on the farm.`);
    }
    return animal;
  };

  // Add routes
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', animalsCount: farm.size });
  });

  app.post('/animals/bird', (req, res) => {
    const { name, canFly, canCrow } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (farm.has(name)) return res.status(400).json({ error: `Animal '${name}' already exists` });
    
    const bird = new Bird(name, canFly, canCrow);
    farm.set(name, bird);
    res.status(201).json({ message: `Bird '${name}' created successfully!`, animal: bird.getStatus() });
  });

  app.post('/animals/dog', (req, res) => {
    const { name, canBark, canChase } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (farm.has(name)) return res.status(400).json({ error: `Animal '${name}' already exists` });
    
    const dog = new Dog(name, canBark, canChase);
    farm.set(name, dog);
    res.status(201).json({ message: `Dog '${name}' created successfully!`, animal: dog.getStatus() });
  });

  app.get('/animals', (req, res) => {
    const animals = Array.from(farm.values()).map(animal => animal.getStatus());
    res.json({ count: animals.length, animals });
  });

  app.put('/animals/:name/action', (req, res) => {
    try {
      const animal = getAnimal(req.params.name);
      const { action } = req.body;
      if (!action) return res.status(400).json({ error: 'action is required' });
      const message = animal.setAction(action);
      res.json({ message, status: animal.getStatus() });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/animals/:name/perform-action', (req, res) => {
    try {
      const animal = getAnimal(req.params.name);
      const message = animal.performAction();
      res.json({ message, status: animal.getStatus() });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});

describe('API Endpoints', () => {
  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /animals/bird', () => {
    test('should create a bird successfully', async () => {
      const response = await request(app)
        .post('/animals/bird')
        .send({ name: 'Tweety', canFly: true, canCrow: false });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('created successfully');
      expect(response.body.animal.name).toBe('Tweety');
      expect(response.body.animal.type).toBe('Bird');
    });

    test('should reject bird without name', async () => {
      const response = await request(app)
        .post('/animals/bird')
        .send({ canFly: true });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name is required');
    });

    test('should reject duplicate bird name', async () => {
      await request(app)
        .post('/animals/bird')
        .send({ name: 'Tweety', canFly: true });
      
      const response = await request(app)
        .post('/animals/bird')
        .send({ name: 'Tweety', canFly: false });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /animals/dog', () => {
    test('should create a dog successfully', async () => {
      const response = await request(app)
        .post('/animals/dog')
        .send({ name: 'Rex', canBark: true, canChase: true });
      
      expect(response.status).toBe(201);
      expect(response.body.animal.name).toBe('Rex');
      expect(response.body.animal.type).toBe('Dog');
      expect(response.body.animal.legs).toBe(4);
    });
  });

  describe('GET /animals', () => {
    test('should return empty array when no animals', async () => {
      const response = await request(app).get('/animals');
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.animals).toEqual([]);
    });

    test('should return all animals', async () => {
      await request(app).post('/animals/bird').send({ name: 'Bird1', canFly: true });
      await request(app).post('/animals/dog').send({ name: 'Dog1', canBark: true });
      
      const response = await request(app).get('/animals');
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.animals).toHaveLength(2);
    });
  });

  describe('Runtime Action Updates', () => {
    test('should update and perform action at runtime', async () => {
      // Create a dog
      await request(app)
        .post('/animals/dog')
        .send({ name: 'Rex', canBark: true, canChase: true });
      
      // Set action to bark
      let response = await request(app)
        .put('/animals/Rex/action')
        .send({ action: 'bark' });
      expect(response.status).toBe(200);
      expect(response.body.status.currentAction).toBe('bark');
      
      // Perform bark action
      response = await request(app).post('/animals/Rex/perform-action');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('barking');
      
      // Update action to chase
      response = await request(app)
        .put('/animals/Rex/action')
        .send({ action: 'chase' });
      expect(response.status).toBe(200);
      expect(response.body.status.currentAction).toBe('chase');
      
      // Perform chase action
      response = await request(app).post('/animals/Rex/perform-action');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('chasing');
    });

    test('should reject invalid action', async () => {
      await request(app)
        .post('/animals/bird')
        .send({ name: 'Tweety', canFly: true });
      
      const response = await request(app)
        .put('/animals/Tweety/action')
        .send({ action: 'bark' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not a valid action');
    });
  });
});
