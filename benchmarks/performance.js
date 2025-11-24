const Bird = require('../models/Bird');
const Dog = require('../models/Dog');

// Performance benchmarks for Animal Farm operations

function benchmark(name, fn, iterations = 10000) {
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  const avgTime = duration / iterations;
  
  console.log(`\n${name}`);
  console.log(`  Total: ${duration.toFixed(2)}ms`);
  console.log(`  Average: ${avgTime.toFixed(4)}ms per operation`);
  console.log(`  Throughput: ${(iterations / (duration / 1000)).toFixed(0)} ops/sec`);
}

console.log('='.repeat(60));
console.log('Animal Farm Performance Benchmarks');
console.log('='.repeat(60));

// Benchmark 1: Animal Creation
benchmark('Bird Creation', () => {
  const bird = new Bird('TestBird', true, false);
}, 100000);

benchmark('Dog Creation', () => {
  const dog = new Dog('TestDog', true, true);
}, 100000);

// Benchmark 2: Action Performance
const bird = new Bird('Speedy', true, false);
bird.setAction('fly');

benchmark('Perform Action (Bird fly)', () => {
  bird.performAction();
}, 100000);

const dog = new Dog('Fast', true, true);
dog.setAction('bark');

benchmark('Perform Action (Dog bark)', () => {
  dog.performAction();
}, 100000);

// Benchmark 3: State Management
benchmark('Set Hungry State', () => {
  bird.setHungry(true);
  bird.setHungry(false);
}, 100000);

benchmark('Eat Operation', () => {
  bird.setHungry(true);
  bird.eat();
}, 100000);

// Benchmark 4: Runtime Updates
benchmark('Runtime Action Update', () => {
  dog.setAction('bark');
  dog.setAction('chase');
}, 50000);

// Benchmark 5: Map Operations (Repository)
const farm = new Map();

benchmark('Map Set (Add Animal)', () => {
  farm.set(`animal${Math.random()}`, bird);
}, 50000);

benchmark('Map Get (Retrieve Animal)', () => {
  farm.get('animal0.5');
}, 100000);

// Benchmark 6: Status Retrieval
benchmark('Get Animal Status', () => {
  bird.getStatus();
}, 100000);

// Benchmark 7: Bulk Operations
console.log('\n' + '='.repeat(60));
console.log('Bulk Operations');
console.log('='.repeat(60));

const bulkFarm = new Map();
const bulkStart = process.hrtime.bigint();

// Create 10,000 animals
for (let i = 0; i < 10000; i++) {
  const animal = i % 2 === 0 
    ? new Bird(`Bird${i}`, true, false)
    : new Dog(`Dog${i}`, true, true);
  bulkFarm.set(animal.name, animal);
}

const bulkEnd = process.hrtime.bigint();
const bulkDuration = Number(bulkEnd - bulkStart) / 1000000;

console.log(`\nCreated 10,000 animals in ${bulkDuration.toFixed(2)}ms`);
console.log(`Average: ${(bulkDuration / 10000).toFixed(4)}ms per animal`);

// Retrieve all animals
const retrieveStart = process.hrtime.bigint();
const allAnimals = Array.from(bulkFarm.values()).map(a => a.getStatus());
const retrieveEnd = process.hrtime.bigint();
const retrieveDuration = Number(retrieveEnd - retrieveStart) / 1000000;

console.log(`\nRetrieved 10,000 animal statuses in ${retrieveDuration.toFixed(2)}ms`);
console.log(`Average: ${(retrieveDuration / 10000).toFixed(4)}ms per animal`);

// Memory usage
const memUsage = process.memoryUsage();
console.log('\n' + '='.repeat(60));
console.log('Memory Usage');
console.log('='.repeat(60));
console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);
console.log(`Array Buffers: ${(memUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);

const avgMemoryPerAnimal = (memUsage.heapUsed / bulkFarm.size);
console.log(`\nAverage memory per animal: ${(avgMemoryPerAnimal / 1024).toFixed(2)} KB`);

console.log('\n' + '='.repeat(60));
console.log('Benchmark Complete');
console.log('='.repeat(60));
