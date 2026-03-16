#include <stdio.h>
#include <stdlib.h>
#include <time.h>
int main(void) {
    time_t now;
    char timebuf[64];
    char *ip;
    /* Get current time */
    time(&now);
    strftime(timebuf, sizeof(timebuf),
             "%Y-%m-%d %H:%M:%S", localtime(&now));
    /* Get client IP */
    ip = getenv("REMOTE_ADDR");
    if (ip == NULL) {
        ip = "Unknown";
    }
    /* HTTP header */
    printf("Content-Type: application/json\r\n\r\n");
    /* JSON output */
    printf("{\n");
    printf("  \"message\": \"Hello World from C CGI\",\n");
    printf("  \"date_time\": \"%s\",\n", timebuf);
    printf("  \"ip_address\": \"%s\"\n", ip);
    printf("}\n");
    return 0;
}

