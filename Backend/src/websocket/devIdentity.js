/*
|--------------------------------------------------------------------------
| Development WebSocket Identity
|--------------------------------------------------------------------------
|
| IMPORTANT:
| DEV_USER_ID must be the actual MongoDB User._id
| of the development user.
|
| Example:
|
| DEV_USER_ID=66c123456789abcdef123456
|
|--------------------------------------------------------------------------
*/

const devIdentity = {

  id:
    process.env.DEV_USER_ID || null,

  name:
    process.env.DEV_USER_NAME || "Krish Gupta"

};


module.exports =
  devIdentity;