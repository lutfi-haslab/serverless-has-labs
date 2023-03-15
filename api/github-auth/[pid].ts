import { VercelRequest, VercelResponse } from "@vercel/node";
import { apiRoute } from '../../utils';
import nextConnect from 'next-connect';
import tiny from "tiny-json-http"
const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_SECRET;
const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
const tokenUrl = "https://github.com/login/oauth/access_token";



apiRoute.get(async (req, res) => {
  switch (req.query.pid) {
    case "login":
      return res.send(`<a href="${authUrl}">Login with Github</a>`);
    case "auth":
      return res.redirect(authUrl);
    case "callback":
      console.log(req.query.code)
      const data = {
        code: req.query.code,
        client_id,
        client_secret
      };

      try {
        const { body } = await tiny.post({
          url: tokenUrl,
          data,
          headers: {
            // GitHub returns a string by default, ask for JSON to make the reponse easier to parse.
            "Accept": "application/json"
          }
        });

        const postMsgContent = {
          token: body.access_token,
          provider: "github"
        };

        // This is what talks to the NetlifyCMS page. Using window.postMessage we give it the
        // token details in a format it's expecting
        const script = `
        <script>
        (function() {
          function recieveMessage(e) {
            console.log("recieveMessage %o", e);
            
            // send message to main window with the app
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(postMsgContent)}', 
              e.origin
            );
          }
    
          window.addEventListener("message", recieveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
        </script>`;

        return res.send(script);

      } catch (err) {
        // If we hit an error we'll handle that here
        console.log(err);
        res.redirect("/?error=😡");
      }
    default:
      return res.json({ message: "Home" });
  }

});


export default apiRoute;