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
    /* Get client IP address from environment */
    ip = getenv("REMOTE_ADDR");
    if (ip == NULL) {
        ip = "Unknown";
    }
    /* CGI header */
    printf("Content-Type: text/html\r\n\r\n");
    /* HTML output */
    printf("<!DOCTYPE html>\n");
    printf("<html><head><title>C CGI Hello</title></head><body>\n");
    printf("<h1>Hello World from C CGI</h1>\n");
    printf("<p>This program was generated with the programming language C.</p>\n");
    printf("<p><strong>Date & Time:</strong> %s</p>\n", timebuf);
    printf("<p><strong>Your IP Address:</strong> %s</p>\n", ip);
    printf("</body></html>\n");
    return 0;
}

