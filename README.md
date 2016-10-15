# Serverless Messenger Bot Boilerplate

_INSTRUCTIONS DRAFT_

**The Objective**
[TBD] Create a Facebook Messenger chatbot that returns the weather.

[TBD] Flowchart of objective
- user sends message from messenger messenger api which forwards it to the api gateway
- lambda sends message to wit.ai that processes it and returns context back
- lambda runs action that requests weather information from Open Weather Map and processes response
- node-wit - send
- lambda sends message to messenger api which forwards it to user

**INSTALL BOILERPLATE**

1. Run `serverless install --url https://github.com/SC5/serverless-messenger-boilerplate.git`
2. Run `npm install`
3. Rename example.env to .env and fill in `FACEBOOK_BOT_VERIFY_TOKEN`
4. Run `serverless deploy` then copy the GET endpoint url

**SETUP FACEBOOK APP**

1. In Facebook Developer site create new Facebook application and page
  * Create Facebook application -> https://developers.facebook.com/quickstarts/?platform=web
  * Create Facebook page -> https://www.facebook.com/pages/create
2. Go to the App Dashboard and under Product Settings and setup webhook by clicking `Setup Webhooks`
  * Callback URL -> url from step 4
  * Verify Token -> from step 3
  * Select Subscription fields `message_deliveries`, `messages`, `messaging_optins`, and `messaging_postbacks`
  * [TBD] flowchart of verification process
3. Click `Verify and Save`
4. In the Token Generation section, select the page created in step 5 and copy the generated token
5. In Webhooks section, select page created in step 5 to be the one that subscribes the webhooks
6. Paste token copied in step 8 to .env file as `FACEBOOK_BOT_PAGE_ACCESS_TOKEN`

More detailed instructions for Facebook Messenger platform configuration can be found from https://developers.facebook.com/docs/messenger-platform/quickstart/

[TBD] Should it be tested at this point?
- Run `serverless deploy`
- Open Facebook page created in step 1 and send message "Hello" to it

**SETUP WIT.AI [TBD]**

Following steps are slightly modified version of https://wit.ai/docs/quickstart

1. Register to wit.ai
2. Click + icon located in top menu to create a new app
3. Type in app name and description
4. If you wish you can change language and data privacy
5. Select _Create App_
6. Select _Create a story_
7. Type "What’s the weather in London tomorrow?" in the "User says" field and press Enter
8. Click on the "Value" dropdown next to `intent` and type "weather", then Enter
9. Click Add a new entity, then select `wit/location`, then highlight "London" in the sentence
10. Click again on Add a new entity, then select `wit/datetime` and highlight "tomorrow" in the sentence
11. Click Bot executes, click on func... and type "getWeather"
12. Click Updates context keys with... and type `temperature && description && datetime`
13. Click Bot sends and type "The weather in {location} {datetime} will be {description} with {temperature}°C."
14. Select "Save Story" on then top of the page
15. Test the bot -> "What’s the weather in London tomorrow?"
16. Click on the branch icon next to forecast in the story
17. Type `temperature && description` in the context-key field
18. Click Bot sends and type "The weather in {location} is {description} with {temperature}°C."
20. Click again on the branch icon next to forecast in the story
21. Type `missingLocation` in the context-key field
22. Click Bot sends and type "Where?"
23. Click User says and type "in Paris". Wit should normally detect the location entity
24. Click on the bookmark icon next to your getForecast action, and type "getWeather", then Enter
25. Click on Jump and select the getWeather bookmark you just created above
26. Select "Save Story" on then top of the page
27. Test the bot -> "What’s the weather in London?" and "What’s the weather?"
28. Select settings
29. Copy App ID
30. Paste token to `.env` file as `WIT_AI_TOKEN`

**SETUP OPEN WEATHER MAP**

1. Register to Open Weather Map
2. Click "Hello username" in the top menu bar
3. Click "Api Keys" -tab
4. Type in key name in "Create key" / "Name" input field and press "Create"
5. Copy the created token
6. Paste token to `.env` file as `WEATHER_API_TOKEN`

**FINAL TOUCH**

1. Run `serverless deploy`
2. Open Messenger and search you bot
3. Now you can ask if your bot knows the weather



_TODO_

1. Session Store using DynamoDB
2. Hook to wit.ai
3. Mechanism for handling requests based on context from Wit.ai and generating response to user
