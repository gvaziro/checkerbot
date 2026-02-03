# Sorsa API v2 – LLM-readable reference

- Base URL: `https://api.sorsa.io/v2`
- Auth: API key in header `ApiKey: <YOUR_API_KEY>`
- Default `Accept: application/json`

## Quick request template

```bash
curl -s \
  -H "Accept: application/json" \
  -H "ApiKey: YOUR_API_KEY" \
  "https://api.sorsa.io/v2/score/elonmusk" 
```

## Endpoints

### GET `/about`

**Summary:** Get info about a user's country, username changes
**Description:** Get info about a user's account. Link or user_id is required. Returns country, username change count, and last username change time.

**Auth:** `ApiKey` header required.

**Query params**
- `link` (string, optional) – link or user_id
- `user_id` (string, optional) – link or user_id

**Responses**
- `200` → `handler.AboutRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/check-comment`

**Summary:** Check if the user posted a comment under the tweet
**Description:** Check if the user posted a comment under the tweet. Returns true/false plus tweet object.

**Auth:** `ApiKey` header required.

**Query params**
- `tweet_link` (string, optional) – tweet_link, user_handle or user_id required
- `user_handle` (string, optional) – tweet_link, user_handle or user_id required
- `user_id` (string, optional) – tweet_link, user_handle or user_id required

**Responses**
- `200` → `handler.CheckCommentResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/check-follow`

**Summary:** Check if the user follows the account
**Description:** Check if the user follows the account. Returns true/false.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CheckFollowReq`
- Notes: project_handle or project_id and user_handle or user_id

**Responses**
- `200` → `handler.CheckFollowResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/check-member`

**Summary:** Checks if a given user is a member of a specified community
**Description:** Verifies whether a user belongs to a particular community. Accepts community_id and user_handle or user_id; returns membership boolean.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CommunityReq`
- Notes: community_id and user_handle or user_id required

**Responses**
- `200` → `handler.CommunityResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/check-quoted`

**Summary:** Check if a user quoted or retweeted a tweet
**Description:** Check if a user has quoted or retweeted a specific tweet. Response includes quoted text, retweet/quote date, and status (retweet/quoted/not found).

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CheckQuotedReq`
- Notes: tweet_link, user_handle or user_id

**Responses**
- `200` → `handler.CheckQuotedResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/check-retweet`

**Summary:** Check if a user retweeted a tweet (100 retweets per request)
**Description:** Check if a user has retweeted a specific tweet by checking up to 100 retweets per request. Use next_cursor to paginate.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CheckRetweetReq`
- Notes: tweet_link, user_handle required, next_cursor optional

**Responses**
- `200` → `handler.CheckRetweetResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/comments`

**Summary:** Get comments (replies) under a tweet
**Description:** Fetch the comments (replies) under a specific tweet. WARNING: beta testing; some comments may not be returned due to bugs.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CommentsReq`
- Notes: tweet_link required, next_cursor optional

**Responses**
- `200` → `handler.CommentsRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/community-tweets`

**Summary:** Get tweets from a community
**Description:** Retrieve tweets from a specified community. community_id required; cursor optional; order_by can be popular or latest (default latest).

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CommunityTweetsReq`
- Notes: community_id required, cursor optional, order_by optional

**Responses**
- `200` → `handler.CommunityTweetsRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/followers-stats`

**Summary:** Get number of followers for each category on TweetScout
**Description:** Get follower statistics by categories: influencers, projects, VC employees. Real-time; may be slow for large accounts; faster if user in DB.

**Auth:** `ApiKey` header required.

**Query params**
- `user_handle` (string, optional) – user_handle or user_id required
- `user_id` (string, optional) – user_handle or user_id required

**Responses**
- `200` → `handler.FollowersStatsResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/follows`

**Summary:** Get a list of user info a specified account follows
**Description:** Retrieve a list of user info that the specified account follows. Provide link or user_id. If order_by is empty: by follow date; if order_by=score: by score.

**Auth:** `ApiKey` header required.

**Query params**
- `link` (string, optional) – link or user_id
- `user_id` (string, optional) – link or user_id
- `order_by` (string, optional) – optional; set to 'score' to sort by score

**Responses**
- `200` → `handler.LookupRes[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/handle-history`

**Summary:** Get the history of Twitter handles
**Description:** Retrieve history of Twitter handles for an account. Requires link or user_id. Returns array of {date, handle}. 404 if not found in DB.

**Auth:** `ApiKey` header required.

**Query params**
- `link` (string, optional) – link or user_id
- `user_id` (string, optional) – link or user_id

**Responses**
- `200` → `handler.HandleHistoriesResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/handle-to-id/{user_handle}`

**Summary:** Get user ID from Twitter handle
**Description:** Retrieve the unique user ID associated with a specified handle.

**Auth:** `ApiKey` header required.

**Path params**
- `user_handle` (string, required) – user_handle required

**Responses**
- `200` → `handler.IDRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/id-to-handle/{user_id}`

**Summary:** Get Twitter handle from user ID
**Description:** Retrieve the Twitter handle associated with a specified user ID.

**Auth:** `ApiKey` header required.

**Path params**
- `user_id` (string, required) – user_id required

**Responses**
- `200` → `handler.HandleRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/info-id/{user_id}`

**Summary:** Get basic Twitter account information by user id
**Description:** Retrieve basic account information: avatar, banner, description, followers/follows counts, id, name, register_date, screen_name, statuses_count, verified.

**Auth:** `ApiKey` header required.

**Path params**
- `user_id` (string, required) – user_id required

**Responses**
- `200` → `handler.LookupRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/info/{user_handle}`

**Summary:** Get basic Twitter account information by user handle
**Description:** Retrieve basic account information: avatar, banner, description, followers/follows counts, id, name, register_date, screen_name, statuses_count, verified.

**Auth:** `ApiKey` header required.

**Path params**
- `user_handle` (string, required) – user_handle required

**Responses**
- `200` → `handler.LookupRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/list-members`

**Summary:** Get members of a Twitter list
**Description:** Retrieve members of a specified list by list_id.

**Auth:** `ApiKey` header required.

**Query params**
- `list_id` (string, required) – list_id required

**Responses**
- `200` → `handler.ListMember[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/list-tweets`

**Summary:** Get tweets from a Twitter list
**Description:** Retrieve tweets from a specified list by list_id. cursor optional for pagination; response includes next_cursor.

**Auth:** `ApiKey` header required.

**Query params**
- `list_id` (string, required) – list_id required, cursor optional
- `cursor` (string, optional) – list_id required, cursor optional

**Responses**
- `200` → `handler.ListTweetsRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/new-following-7d`

**Summary:** Get a list of new follows from past 7 days
**Description:** Returns accounts that the specified account followed in the last 7 days. Requires user_handle or user_id. Empty list if none. Account must exist in DB.

**Auth:** `ApiKey` header required.

**Query params**
- `user_handle` (string, optional) – user_handle or user_id
- `user_id` (string, optional) – user_handle or user_id

**Responses**
- `200` → `types.Follower[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/score-changes`

**Summary:** Get score stats
**Description:** Retrieve score delta stats (week/month). Works with DB: user must exist on website.

**Auth:** `ApiKey` header required.

**Query params**
- `user_handle` (string, optional) – user_handle or user_id required
- `user_id` (string, optional) – user_handle or user_id required

**Responses**
- `200` → `handler.ScoreChangesResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/score-id/{user_id}`

**Summary:** Get info on score of account by ID on TweetScout
**Description:** Score estimates popularity among Influencers, Projects, and VCs. May be slow for large follower counts.

**Auth:** `ApiKey` header required.

**Path params**
- `user_id` (string, required) – user_id required

**Responses**
- `200` → `handler.ScoreResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/score/{user_handle}`

**Summary:** Get info on score of account on TweetScout
**Description:** Score estimates popularity among Influencers, Projects, and VCs. May be slow for large follower counts.

**Auth:** `ApiKey` header required.

**Path params**
- `user_handle` (string, required) – user_handle required

**Responses**
- `200` → `handler.ScoreResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/search-tweets`

**Summary:** Search for tweets using a specific query
**Description:** Retrieve tweets matching a query (Twitter-like search). query required; next_cursor optional; order optional.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.SearchTweetsReq`
- Notes: query required, next_cursor optional

**Responses**
- `200` → `handler.SearchTweetsRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/search-users`

**Summary:** Search for Twitter users by keyword
**Description:** Search for accounts by keyword/phrase. query required; next_cursor optional. Results sorted by relevance.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.SearchUsersReq`
- Notes: query required, next_cursor optional

**Responses**
- `200` → `handler.SearchUsersRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/top-followers/{user_handle}`

**Summary:** Get top 20 account followers by TweetScout score
**Description:** Returns basic account info + score for top 20 followers with highest score. If speed is more important: use query param from=db.

**Auth:** `ApiKey` header required.

**Path params**
- `user_handle` (string, required) – user_handle required

**Query params**
- `from` (string, optional) – optional; use 'db' for speed

**Responses**
- `200` → `types.Account[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### GET `/top-following/{user_handle}`

**Summary:** Get top 20 account follows by TweetScout score
**Description:** Returns basic account info + score for top 20 follows with highest score.

**Auth:** `ApiKey` header required.

**Path params**
- `user_handle` (string, required) – user_handle required

**Responses**
- `200` → `types.Account[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/tweet-info`

**Summary:** Get user ID and tweet text from a tweet link
**Description:** Retrieve tweet info by tweet link. Response returns tweet info metadata.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.TweetInfoReq`
- Notes: tweet_link required

**Responses**
- `200` → `handler.TweetInfoResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/tweet-info-bulk`

**Summary:** Return tweet info from multiple tweet links
**Description:** Return array of tweet info for multiple tweet links. Up to 100 tweets per request.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.TweetInfoBulkReq`
- Notes: tweet_links required (up to 100)

**Responses**
- `200` → `types.ListItem[]`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/user-tweets`

**Summary:** Retrieve info of a user's tweets
**Description:** Fetch tweets posted by a user. Requires link or user_id; cursor optional. Response includes next_cursor.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.UserTweetsReq`
- Notes: link or user_id required, cursor optional

**Responses**
- `200` → `handler.UserTweetsRes`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`

### POST `/when-follow`

**Summary:** Get date when one account followed another
**Description:** Get date when one account followed another. Works only if both accounts already in DB. If not following returns false.

**Auth:** `ApiKey` header required.

**Request body**
- Content-Type: `application/json`
- Schema: `handler.CheckFollowReq`
- Notes: project_handle or project_id and user_handle or user_id

**Responses**
- `200` → `handler.FollowDateResp`
- `400` → `handler.ErrorResponse`
- `403` → `handler.ErrorResponse`
- `404` → `handler.ErrorResponse`
- `500` → `handler.ErrorResponse`
