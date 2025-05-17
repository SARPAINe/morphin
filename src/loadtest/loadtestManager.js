import http from "k6/http";
import { sleep, check } from "k6";

// Load test options
export const options = {
  vus: 10000, // number of concurrent virtual users
  duration: "60s", // total test duration
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
  },
};

const BASE_URL = "http://localhost:3000/api/v1";

export default function () {
  // Randomly select an employee ID from the list
  const randomId = Math.floor(Math.random() * 1000) + 1;

  const res = http.get(`${BASE_URL}/employees/managers/${randomId}`);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
