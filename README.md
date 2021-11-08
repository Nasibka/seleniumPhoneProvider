# Development (Locally)
1. Необходимо поднять docker контейнер с webdriver
   1. ```docker run -it --rm -p 4444:4444 selenium/standalone-chrome:3.141.59```
1. Run `npm install`
2. Run `npm run staging`

Note: For now changes on server side temporary are not under --watch. And we have to restart server manually. Hope it is not a problem because changes on server side are rare.

# Production (Locally)
1. Необходимо поднять docker контейнер с webdriver
    1. ```docker run -it --rm -p 4444:4444 selenium/standalone-chrome:3.141.59```
1. Run `npm install`
2. Run `npm run production`


# Deploy to kubernetes
1. Для работы сервиса необходимо разово руками поднять deployment webdriver
    1. Deployment.yaml лежит в папке webdriver-kubernetes
    2. ```kubectl apply -f deployment.yml```

