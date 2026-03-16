#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#define MAX_BODY 8192
int main(void) {
    char *method;
    char *ip;
    char *ua;
    char *query;
    char *content_type;
    char *content_length_str;
    int content_length = 0;
    char body[MAX_BODY + 1] = {0};
    char hostname[256] = "unknown";
    char timebuf[64];
    /* Get environment variables */
    method = getenv("REQUEST_METHOD");
    ip = getenv("REMOTE_ADDR");
    ua = getenv("HTTP_USER_AGENT");
    query = getenv("QUERY_STRING");
    content_type = getenv("CONTENT_TYPE");
    content_length_str = getenv("CONTENT_LENGTH");
    if (content_length_str) {
        content_length = atoi(content_length_str);
        if (content_length > MAX_BODY) {
            content_length = MAX_BODY;
        }
    }
    /* Read request body if present */
    if (content_length > 0) {
        fread(body, 1, content_length, stdin);
        body[content_length] = '\0';
    }
    /* Hostname */
    gethostname(hostname, sizeof(hostname));
    /* Time */
    time_t now = time(NULL);
    strftime(timebuf, sizeof(timebuf),
             "%Y-%m-%d %H:%M:%S", localtime(&now));
    /* Output HTTP header */
    printf("Content-Type: application/json\r\n\r\n");
    /* JSON output */
    printf("{\n");
    printf("  \"message\": \"Echo from C CGI\",\n");
    printf("  \"hostname\": \"%s\",\n", hostname);
    printf("  \"timestamp\": \"%s\",\n", timebuf);
    printf("  \"method\": \"%s\",\n", method ? method : "UNKNOWN");
    printf("  \"ip_address\": \"%s\",\n", ip ? ip : "UNKNOWN");
    printf("  \"user_agent\": \"%s\",\n", ua ? ua : "UNKNOWN");
    printf("  \"content_type\": \"%s\",\n",
           content_type ? content_type : "");
    printf("  \"query_string\": \"%s\",\n",
           query ? query : "");
    printf("  \"raw_body\": \"%s\"\n", body);
    printf("}\n");
    return 0;
}

