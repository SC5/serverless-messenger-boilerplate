# serverless-messenger-boilerplate
Serverless messenger bot boilerplate

_INSTRUCTIONS DRAFT_

* INSTALL BOILERPLATE *

1. Run `serverless install --url https://github.com/SC5/serverless-messenger-boilerplate.git`
2. Run `npm install`
3. Rename example.env to .env and fill in FACEBOOK_BOT_VERIFY_TOKEN
4. Run `serverless deploy` then copy the GET endpoint url to clipboard

* SETUP FACEBOOK APP *

1. In Facebook Developer site create new Facebook application and page
  * Create Facebook application -> https://developers.facebook.com/quickstarts/?platform=web
  * Create Facebook page -> https://www.facebook.com/pages/create
2. Setup webhook by clicking `Setup Webhooks`
  * Callback URL -> url from step 4
  * Verify Token -> from step 3
  * Select Subscription fields `message_deliveries`, `messages`, `messaging_optins`, and `messaging_postbacks`
3. Click `Verify and Save`
4. In the Token Generation section, select the page created in step 5 and copy the generated token
5. In Webhooks section, select page created in step 5 to be the one that subscribes the webhooks
6. Paste token copied in step 8 to .env file as FACEBOOK_BOT_PAGE_ACCESS_TOKEN
7. Run `serverless deploy`
8. Open Facebook page created in step 5 and send message to it

More detailed instructions for Facebook Messenger platform configuration can be found from https://developers.facebook.com/docs/messenger-platform/quickstart/

* SETUP WIT.AI *

1. Register to WIT.AI
2. -> Quick start

* SETUP OPEN WEATHER MAP *

1. Register to Open Weather Map
2. Click "Hello username" in the top menu bar
3. Click "Api Keys" -tab
4. Type in key name in "Create key" / "Name" input field and press "Create"
5. Copy the created token
6. Paste token to `.env` file as `WEATHER_API_TOKEN`


_TODO_

1. Session Store using DynamoDB
2. Hook to wit.ai
3. Mechanism for handling requests based on context from Wit.ai and generating response to user
