name: SOLAR

on:
  push:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      # Backend (`b`)
      - name: b
        run: npm install
        working-directory: ./b

      - name: Run backend tests
        run: npm test
        working-directory: ./b

      # Frontend (`f`)
      - name: f
        run: npm install
        working-directory: ./f

      - name: Run frontend tests
        run: npm test
        working-directory: ./f

      - name: Build frontend
        run: npm run build
        working-directory: ./f

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      # Backend deployment
      - name: Deploy Backend to Render
        env:
          RENDER_API_KEY_BACKEND: ${{ secrets.RENDER_API_KEY_BACKEND }}
        run: |
          curl -X POST \
            -H "Authorization: Bearer $RENDER_API_KEY_BACKEND" \
            https://api.render.com/v1/services/{backend-service-id}/deploys

      # Frontend deployment
      - name: Deploy Frontend to Render
        env:
          RENDER_API_KEY_FRONTEND: ${{ secrets.RENDER_API_KEY_FRONTEND }}
        run: |
          curl -X POST \
            -H "Authorization: Bearer $RENDER_API_KEY_FRONTEND" \
            https://api.render.com/v1/services/{frontend-service-id}/deploys
