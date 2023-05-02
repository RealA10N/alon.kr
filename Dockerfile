FROM node:18-alpine

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV PORT=80
CMD ["node", "build"]