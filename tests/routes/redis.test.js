const chai = require('chai');
const chaiHttp = require('chai-http');
const redisClient = require('../utils/redis');
const { expect } = chai;

chai.use(chaiHttp);

describe('Redis Client', () => {
  it('should return true when Redis is alive', () => {
    const isAlive = redisClient.isAlive();
    expect(isAlive).to.be.true;
  });

  it('should store and retrieve values correctly from Redis', async () => {
    await redisClient.set('testKey', 'testValue', 60);
    const value = await redisClient.get('testKey');
    expect(value).to.equal('testValue');
  });

  it('should delete values from Redis', async () => {
    await redisClient.set('testKeyToDelete', 'value', 60);
    await redisClient.del('testKeyToDelete');
    const value = await redisClient.get('testKeyToDelete');
    expect(value).to.be.null;
  });
});
