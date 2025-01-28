const jwt        = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const md5        = require('md5');


module.exports = class TokenManager {
    constructor({config}){
        this.config              = config;
        this.longTokenExpiresIn  = '3y';
        this.shortTokenExpiresIn = '1y';
        this.userExposed         = ['v1_createShortToken']; // exposed functions
    }

    /** 
     * short token are issue from long token 
     * short tokens are issued for 72 hours 
     * short tokens are connected to user-agent
     * short token are used on the soft logout 
     * short tokens are used for account switch 
     * short token represents a device. 
     * long token represents a single user. 
     *  
     * long token contains immutable data and long lived
     * master key must exists on any device to create short tokens
     */

    genLongToken({ userId, role, schoolId }) {
        return jwt.sign(
          { userId, role, schoolId },
          this.config.dotEnv.LONG_TOKEN_SECRET,
          { expiresIn: this.longTokenExpiresIn }
        );
      }
    
      genShortToken({ userId, role, schoolId, deviceId }) {
        return jwt.sign(
          { userId, role, schoolId, deviceId },
          this.config.dotEnv.SHORT_TOKEN_SECRET,
          { expiresIn: this.shortTokenExpiresIn }
        );
      }
    
      verifyLongToken({ token }) {
        try {
          const decoded = jwt.verify(token, this.config.dotEnv.LONG_TOKEN_SECRET);
          return decoded; // { userId, role, schoolId, iat, exp }
        } catch (err) {
          return null;
        }
      }
    
      verifyShortToken({ token }) {
        try {
          const decoded = jwt.verify(token, this.config.dotEnv.SHORT_TOKEN_SECRET);
          return decoded;
        } catch (err) {
          return null;
        }
      }



    _verifyToken({token, secret}){
        let decoded = null;
        try {
            decoded = jwt.verify(token, secret);
        } catch(err) { console.log(err); }
        return decoded;
    }

    /** generate shortId based on a longId */
    v1_createShortToken({__headers, __device}){
        const token = __headers.token;
        if(!token)return {error: 'missing token '};
        console.log('found token', token);

        let decoded = this.verifyLongToken({ token });
        if(!decoded){ return {error: 'invalid'} };
        
        let shortToken = this.genShortToken({
            userId: decoded.userId, 
            userKey: decoded.userKey,
            sessionId: nanoid(),
            deviceId: md5(__device),
        });

        return { shortToken };
    }
}