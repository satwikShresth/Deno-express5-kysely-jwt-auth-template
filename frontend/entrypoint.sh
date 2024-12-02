#!/bin/sh

if [ "${NODE_ENV}" = "development" ]; then 
   npm install
   npm run dev
else
   npm run build
fi
