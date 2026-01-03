package main

import (
	"fmt"
	"net/http"
)

// PAPAYA_SERVER_PORT := os.Getenv("PAPAYA_SERVER_PORT")

const PAPAYA_SERVER_PORT = 8080

func helloworld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}

func main() {

	http.HandleFunc("/helloworld", helloworld)

	http.ListenAndServe(fmt.Sprintf(":%d", PAPAYA_SERVER_PORT), nil)
}
