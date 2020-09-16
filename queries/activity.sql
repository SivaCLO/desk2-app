/* First User Timestamp: 1599822601433 */

/* All User Activities */
SELECT c.userName, c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* First-time login window shown */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/show' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC
SELECT TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/show' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* First-time login token submit */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/submit' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/submit' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* All login attempts */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/login-medium-token' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/login-medium-user' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* All successful logins */
SELECT COUNT(c._self) FROM c WHERE c.activityCode = 'login-window/login-success' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC
SELECT c.userName, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.activityCode = 'login-window/login-success' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* All User Errors */
SELECT c.userName, c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE CONTAINS(c.activityCode, 'error') AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC

/* Specific User Activity */
SELECT c.activityCode, c.activityData, TimestampToDateTime(c.activityTime) FROM c WHERE c.userName = 'Clove_Steve' AND c.activityTime >= 1599822601433 ORDER BY c.activityTime DESC
