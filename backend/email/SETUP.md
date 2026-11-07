# Required live Supabase Auth settings
Project: kipxvfvqbzfzezngsuyt
Site URL: https://mealday-kitchen-app.jauntycomet1.chatgpt.site
Redirect allowlist: https://mealday-kitchen-app.jauntycomet1.chatgpt.site/?auth=confirmed
Confirm signup subject: Confirm your email · Welcome to Mealday
Confirm signup HTML: confirm-signup.html
Use ConfirmationURL so Supabase validates the link before redirecting to the app. Public chef asset is served without authentication; no user data is exposed by the asset function.

Sender display name 'Mealday' requires custom SMTP configuration (provider + verified sending domain). Updating the template alone does not change the default Supabase From address/display name. Disable link tracking on the email provider. Do not disable email verification.

Existing confirmation emails retain their old redirect URLs. After settings are saved, request a new confirmation from the app. Test fresh signup + return to live site + session before calling the flow complete.
