const axios = require("axios");
const qs = require("qs");

module.exports.handler = async (context, req) => {
  context.log(context.bindings.signinDocument);

  if (context.bindings.signinDocument && context.bindings.signinDocument.length > 0) {
    context.bindings.newSigninDocument = context.bindings.signinDocument[0];
    context.log(req.query.code);

    try {
      let response1 = await axios({
        method: "post",
        url: "https://api.medium.com/v1/tokens",
        data: qs.stringify({
          code: req.query.code,
          client_id: "cf95dd471267",
          client_secret: "4e52ea0f09668b65ecffba7cb3bd413f3219a9bc",
          grant_type: "authorization_code",
          redirect_uri: "https://desk11.azurewebsites.net/api/v1.2/signin/callback",
        }),
      });
      context.log(response1.data);

      if (response1.data) {
        context.bindings.newSigninDocument.mediumTokens = response1.data;
        let response2 = await axios({
          method: "get",
          url: "https://api.medium.com/v1/me",
          headers: {
            Authorization: response1.data.token_type + " " + response1.data.access_token,
          },
        });
        context.log(response2.data);

        if (response2.data) {
          context.bindings.newSigninDocument.mediumUser = response2.data.data;
          context.res = {
            status: 200,
            headers: {
              "Content-Type": "text/html",
            },
            body: `
            <!DOCTYPE html>
            <html
              style="
                -webkit-app-region: drag;
                width: 100%;
                height: 100%;
                background: url('https://thumbs.gfycat.com/CorruptOldfashionedGuineapig-small.gif') center center no-repeat;
                background-size: 35px 35px;
              "
            />
            `,
          };
          context.done();
        } else {
          context.res = { status: 500 };
          context.done();
        }
      } else {
        context.res = { status: 500 };
        context.done();
      }
    } catch (e) {
      context.log(e);
      context.res = { status: 500 };
      context.done();
    }
  } else {
    context.res = { status: 500 };
    context.done();
  }
};
