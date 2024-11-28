#!/bin/sh

if [ "${ENV}" = "development" ]; then 
  deno install
  deno task migrate:latest
  deno task seed
  deno fmt --watch &
  deno task dev
else
  deno install --allow-scripts
  deno task start
fi
