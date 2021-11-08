// checks for correct environment
const mainConfig = require('./config/main.json')
const env = process.env.ENVIRONMENT || 'production'
if (mainConfig.environments.indexOf(env) === -1) {
    console.log('Error: unsupported environment, passed ENVIRONMENT = ', env);
    return;
}

require("./db");
const CronJob = require('cron').CronJob;
const Config = require('./config')

const {Builder, By, until,} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options()

const CAR = require('./models/cars')
const PROXY = require("./models/proxy");


let isProcessing = false;

async function getPhones(){
    options.addArguments('--headless')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--no-sandbox')
    
    if(Config.useProxy){
        let proxies
        if(Config.environment === 'production'){
            proxies = await PROXY.find({banned:false,flag:false})
        }else{
            proxies = await PROXY.find({banned:false,flag:true})
        } 

        const proxy = proxies[Math.floor(Math.random()*proxies.length)]
        console.log('proxy '+proxy.proxy)
        options.addArguments(`--proxy-server=${proxy.proxy}`)
    }
    

    // rand_array=['.offer__parameters','.offer__title','.year','.a-add__hint','.value-title']
    rand_array2=['100','200','300','400','500','600','700','800','900']

    let driver = new Builder()
        .forBrowser('chrome')
        .usingServer(Config.webdriverServer)
        .setChromeOptions(options)
        .build();
    driver.manage().window().maximize()
    //change limit
    let cars = await CAR.find({phone:null,isArchive:false}).limit(20)
    console.log('cars without phone: '+cars.length)
    await driver.get('https://kolesa.kz')
    for(car of cars){
        try{
            console.log('https://kolesa.kz/a/show/'+car.id);
            await driver.get('https://kolesa.kz/a/show/'+car.id);
            //random movements
            // const element  = rand_array[Math.floor(Math.random() * rand_array.length)];
            // await driver.findElement(By.css(element)).click();
            let number =  rand_array2[Math.floor(Math.random() * rand_array2.length)];
            await driver.executeScript(`window.scrollBy(0,${number})`);

            await driver.wait(until.elementLocated(By.css('.seller-phones__show-button')), 3000).then(async function(elm) {
                await addPhone()
            }).catch(async function(ex) {
                car.isArchive = true
                await car.save()
            });
        }
        catch(err){
            console.log(err,67)
        }

        async function addPhone(){
            //find show phone button
            await driver.findElement(By.css('.seller-phones__show-button')).click();
            await driver.wait(until.elementLocated(By.css('.seller-phones__phones-list')), 3000);
            let phones = await driver.findElement(By.css('.seller-phones__phones-list')).findElements(By.tagName('li'))
            const array = []
            for(phone of phones){
                const p = await phone.getText()
                array.push(p.replace(/ /g,'').replace('+',''))
            }

            console.log(array.join(','))
            car.phone = array.join(',')
            await car.save()
        }

    }
    await driver.close()
    console.log('Quitted browser')
    await driver.quit()
    console.log('Finished')
    isProcessing = false
}

//TODO make it wait until getPhones finishes
var job = new CronJob(Config.getPhonesCron, async function() {
    if (isProcessing) {
        console.log('Not finished')
        return
    }

    isProcessing = true
    console.log('Started')
    await getPhones()
});
job.start()
