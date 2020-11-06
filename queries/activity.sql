/* First User Timestamp - 1599822601433 */
/* v1.0.1 - 1600352616000 */

/* Filters */
WHERE c.deskType = "writer" OR c.deskType = "editor" ORDER BY c.id DESC
WHERE c.deskType = "writer" OR c.deskType = "editor" ORDER BY c.activityTime DESC

/* All User Activities */
SELECT c.userName, c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.userName != "sivaragavan" AND c.userName != "balasurendaran" AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT c.userName, COUNT(c._self) FROM c WHERE c.activityTime >= 1600352616000 GROUP BY c.userName

/* First-time login window shown */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/show' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/show' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC

/* First-time login token submit */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/submit' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/submit' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC

/* All login attempts */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/login-medium-token' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/login-medium-user' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC

/* All successful logins */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/login-success' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/login-success' AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC

/* All User Errors */
SELECT c.userName, c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE CONTAINS(c.activityCode, 'error') AND c.activityTime >= 1600352616000 ORDER BY c.activityTime DESC

/* Specific User Activity */
SELECT c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.userName = 'lowjiayu' ORDER BY c.activityTime DESC

/* Published Stories */
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) from c WHERE c.activityCode = "draft-view/publish" AND c.activityTime >= 1600352616000 ORDER BY c.activityTime
SELECT c.activityData.fromURL, c.activityData.url FROM c WHERE c.activityCode = "draft-view/will-navigate" AND CONTAINS (c.activityData.url, "https://medium.com/@")
