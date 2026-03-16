#include <stdio.h>
#include <stdlib.h>
/* CGI programs receive environment via environ */
extern char **environ;
int main(void) {
    char **env;
    /* HTTP header */
    printf("Content-Type: application/json\r\n\r\n");
    printf("{\n");
    for (env = environ; *env != NULL; env++) {
        char *entry = *env;
        char *eq = entry;
        /* Find '=' separating key and value */
        while (*eq && *eq != '=') {
            eq++;
        }
        if (*eq == '=') {
            *eq = '\0';  /* split key/value */
            printf("  \"%s\": \"%s\"", entry, eq + 1);
            /* Peek ahead to see if this is the last entry */
            if (*(env + 1) != NULL) {
                printf(",");
            }
            printf("\n");
            *eq = '=';  /* restore string */
        }
    }
    printf("}\n");
    return 0;
}
