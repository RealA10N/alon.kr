FROM node:24-alpine

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
ENV PORT=80
CMD ["node", "build"]