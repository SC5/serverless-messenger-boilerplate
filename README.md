# serverless-messenger-boilerplate
Serverless messenger bot boilerplate

_INSTRUCTIONS DRAFT_

1. Clone repository
2. Run `npm install`
3. Rename example.env to .env and fill in FACEBOOK_BOT_VERIFY_TOKEN
4. Run `serverless deploy` then copy the GET endpoint url to clipboard

Next configure Facebook Messenger platform (more details: https://developers.facebook.com/docs/messenger-platform/quickstart/)
5. In Facebook Developer site create new Facebook application and page
  * Create Facebook application -> https://developers.facebook.com/quickstarts/?platform=web
  * Create Facebook page -> https://www.facebook.com/pages/create

6. Setup webhook by clicking `Setup Webhooks`
  * Callback URL -> url from step 4
  * Verify Token -> from step 3
  * Select Subscription fields `message_deliveries`, `messages`, `messaging_optins`, and `messaging_postbacks`

7. Click `Verify and Save`
8. In the Token Generation section, select the page created in step 5 and copy the generated token
9. In Webhooks section, select page created in step 5 to be the one that subscribes the webhooks
10. Paste token copied in step 8 to .env file as FACEBOOK_BOT_PAGE_ACCESS_TOKEN
11. Run `serverless deploy`
12. Open Facebook page created in step 5 and send message to it