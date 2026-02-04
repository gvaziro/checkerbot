const axios = require('axios');
const dayjs = require('dayjs');

class TweetScoutService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tweetscout.io/v2';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000, // 15 seconds timeout to prevent hanging
      headers: {
        'Accept': 'application/json',
        'ApiKey': this.apiKey
      }
    });
  }

  async getAccountInfo(handle) {
    try {
      console.log(`[TweetScout] Fetching info for @${handle}...`);
      const response = await this.client.get(`/info/${handle}`);
      console.log(`[TweetScout] ✅ Info for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching info for ${handle}:`, error.message);
      return null;
    }
  }

  async getAccountScore(handle) {
    try {
      console.log(`[TweetScout] Fetching score for @${handle}...`);
      const response = await this.client.get(`/score/${handle}`);
      console.log(`[TweetScout] ✅ Score for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching score for ${handle}:`, error.message);
      return null;
    }
  }

  async getFollowerStats(handle) {
    try {
      console.log(`[TweetScout] Fetching follower stats for @${handle}...`);
      const response = await this.client.get(`/followers-stats`, {
        params: { user_handle: handle }
      });
      console.log(`[TweetScout] ✅ Follower stats for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching follower stats for ${handle}:`, error.message);
      return null;
    }
  }

  async getAbout(handle) {
    try {
      console.log(`[TweetScout] Fetching about info for @${handle}...`);
      const response = await this.client.get(`/about`, {
        params: { link: handle }
      });
      console.log(`[TweetScout] ✅ About info for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching about info for ${handle}:`, error.message);
      return null;
    }
  }

  async getTopFollowers(handle) {
    try {
      console.log(`[TweetScout] Fetching top followers for @${handle}...`);
      const response = await this.client.get(`/top-followers/${handle}`, {
        params: { from: 'db' }
      });
      console.log(`[TweetScout] ✅ Top followers for @${handle} received.`);
      return response.data;
    } catch (error) {
      console.error(`[TweetScout] ❌ Error fetching top followers for ${handle}:`, error.message);
      return [];
    }
  }
}

module.exports = TweetScoutService;
