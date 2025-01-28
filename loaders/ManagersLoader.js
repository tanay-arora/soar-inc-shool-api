const MiddlewaresLoader     = require('./MiddlewaresLoader');
const ApiHandler            = require("../managers/api/Api.manager");
const LiveDB                = require('../managers/live_db/LiveDb.manager');
const UserServer            = require('../managers/http/UserServer.manager');
const ResponseDispatcher    = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const VirtualStack          = require('../managers/virtual_stack/VirtualStack.manager');
const ValidatorsLoader      = require('./ValidatorsLoader');
const ResourceMeshLoader    = require('./ResourceMeshLoader');
const utils                 = require('../libs/utils');

const systemArch            = require('../static_arch/main.system');
const TokenManager          = require('../managers/token/Token.manager');
const SharkFin              = require('../managers/shark_fin/SharkFin.manager');
const TimeMachine           = require('../managers/time_machine/TimeMachine.manager');


const SchoolManager         = require('../managers/entities/school/School.manager');
const ClassroomManager      = require('../managers/entities/classroom/Classroom.manager');
const StudentManager        = require('../managers/entities/student/Student.manager');
const UserManager           = require('../managers/entities/user/User.manager');

/** 
 * load sharable modules
 * @return modules tree with instance of each module
*/
module.exports = class ManagersLoader {
    constructor({ config, cortex, cache, oyster, aeon }) {

        this.managers   = {};
        this.config     = config;
        this.cache      = cache;
        this.cortex     = cortex;
        
        this._preload();
        this.injectable = {
            utils,
            cache, 
            config,
            cortex,
            oyster,
            aeon,
            managers: this.managers, 
            validators: this.validators,
            // mongomodels: this.mongomodels,
            resourceNodes: this.resourceNodes,
        };
        
    }

    _preload(){
        const validatorsLoader    = new ValidatorsLoader({
            models: require('../managers/_common/schema.models'),
            customValidators: require('../managers/_common/schema.validators'),
        });
        const resourceMeshLoader  = new ResourceMeshLoader({})
        // const mongoLoader      = new MongoLoader({ schemaExtension: "mongoModel.js" });

        this.validators           = validatorsLoader.load();
        this.resourceNodes        = resourceMeshLoader.load();
        // this.mongomodels          = mongoLoader.load();

    }

    load() {
        this.managers.responseDispatcher = new ResponseDispatcher();
        this.managers.token = new TokenManager(this.injectable);
      
        this.managers.school    = new SchoolManager({ ...this.injectable, validators: this.validators });
        this.managers.classroom = new ClassroomManager({ ...this.injectable, validators: this.validators });
        this.managers.student   = new StudentManager({ ...this.injectable, validators: this.validators });
        this.managers.user      = new UserManager({ ...this.injectable, validators: this.validators });
        
        const middlewaresLoader = new MiddlewaresLoader(this.injectable);
        const mwsRepo = middlewaresLoader.load();
        this.injectable.mwsRepo = mwsRepo;
      
        this.managers.mwsExec = new VirtualStack({
          ...this.injectable
        });
      
        this.managers.userApi = new ApiHandler({
          ...this.injectable,
          prop: 'httpExposed'
        });
      
        this.managers.userServer = new UserServer({
          config: this.config,
          managers: this.managers
        });
      
        return this.managers;
      }
      

}

