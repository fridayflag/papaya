package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/fridayflag/papaya/internal/api"
	"github.com/fridayflag/papaya/internal/auth"
	"github.com/fridayflag/papaya/internal/config"
	"github.com/fridayflag/papaya/internal/env"
	"github.com/fridayflag/papaya/internal/proxy"
	"github.com/fridayflag/papaya/internal/static"
)

func main() {
	cfg, err := env.Load()
	if err != nil {
		log.Fatalf("env: %v", err)
	}

	_, _ = config.Load(cfg.ConfigDir) // TODO: use when config is implemented

	dbProxy, err := proxy.ReverseProxy("/db", cfg.CouchDBProxiedURL)
	if err != nil {
		log.Fatalf("proxy: %v", err)
	}

	tokenStore, err := auth.Open(cfg.AuthDBPath)
	if err != nil {
		log.Fatalf("auth store: %v", err)
	}
	defer tokenStore.Close()

	ginRouter, err := api.Router(cfg, tokenStore)
	if err != nil {
		log.Fatalf("api: %v", err)
	}

	spa, err := static.SPA(cfg.StaticAssetsDir)
	if err != nil {
		log.Fatalf("static: %v", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/db/", dbProxy)
	mux.Handle("/db", http.RedirectHandler("/db/", http.StatusMovedPermanently))
	mux.Handle("/api/", ginRouter)
	mux.Handle("/", spa)

	addr := ":" + strconv.Itoa(cfg.ServerPort)
	log.Printf("Papaya server listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
