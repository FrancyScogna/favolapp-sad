import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 VUs in 1 minute
    { duration: '2m', target: 50 }, // Hold 50 VUs for 2 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 VUs in 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete under 3 seconds
    http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
  },
};

const GRAPHQL_ENDPOINT = 'https://spi5hle6fngqla765atjxwpsty.appsync-api.eu-west-1.amazonaws.com/graphql'; // Replace with your AppSync endpoint
const AUTH_TOKEN = 'eyJraWQiOiJQaG5mSW56enFsU0ZLeVNXZDJFT3YrVVloemQ2NUxUbjVtXC91bEFiTDZjRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkMmM1OTQzNC02MGMxLTcwZmQtYzM0Zi1iODA2ZWI4MGY0MTMiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNzVPa1dSeHVBIiwiY29nbml0bzp1c2VybmFtZSI6ImQyYzU5NDM0LTYwYzEtNzBmZC1jMzRmLWI4MDZlYjgwZjQxMyIsIm9yaWdpbl9qdGkiOiIzMjliMjU1NC0wMzVmLTRmOGUtYjkxYS02ODdhZDhjNTA3OTkiLCJhdWQiOiI1aGo2cGpsc2pqOWhiNXBuMG1vNWc0MmpqMSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzMzODUyNzI4LCJleHAiOjE3MzM5NDEzNzEsImlhdCI6MTczMzkzNzc3MSwianRpIjoiNzlhZGNiM2QtNWJlMi00NzBkLWFjODAtMzIwNTA2NTZjYTMxIiwiZW1haWwiOiJmcmFuY29zY29AaG90bWFpbC5pdCJ9.Gb0hstYZiZxj5DgljWwe2TwPrJ3pAg6hxX8Ftj6C4p2LVohEPTTmb5ejlGPre1Y90mQl5fQdf2WxnojzbR6rFvdeIQlyLxIFUZRyn-9VH5lwXn5F9epglRENCq_rSic2z5Y-BUYfQdq3TCTxUYaPS7jQh-i-CMBso9FyksYlrBYphiyJBdjDxNw0dGBZTpd54rsnPVtaeMpGiXj9nE15Mq41oaZF4jBqkw9jBKOGoCEArq__RfNqQ-gMLk18LFTCsEAJLyHQ6NmV_3CSgOa8IGjNSDQpYdjSK_FBxQswiMDoqEVbClzC1ElmCjqQr17-Wmn8j6lu8mdf40H1-U_rQQ'; // Replace with a valid Cognito token or API key

const query = `
  query GetUsersList($limit: Int, $nextToken: String) {
    getUsersList(limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        name
        surname
        role
        birthdate
        phone_number
        gender
        codfis
        provincia
        comune
        title
        createdAt
        updatedAt
        pazientiCount
        tasksCount
        reportsCount
        avatarURL
        active
      }
      nextToken
    }
  }
`;

export default function () {
  const payload = JSON.stringify({
    query: query,
    //variables: { id: "123" }, // Replace with a valid ID or test data
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_TOKEN, // Auth token for AppSync
    },
  };

  const res = http.post(GRAPHQL_ENDPOINT, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
