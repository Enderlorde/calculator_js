class EventEmitter{
    #events = {};
    constructor(){
        this.#events 
    }

    on(event, listener){
        (this.#events[event] || (this.#events[event] = [])).push(listener);
        return this;
    }

    emit(event, args){
        (this.#events[event] || []).slice().forEach(listener => listener(args));
    }
}

//обнять и плакать
Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
}

class CalculatorModel extends EventEmitter{
    #powered = false;
    #buffer = 0;
    #operation = '';
    #result = 0;
    #memory = 0;

    constructor(){
        super(); 
    }

    useOperation(operator){
        switch (operator){
            case 'difference':
                this.#result = this.#result - this.#buffer;
                break;

            case 'summary':
                this.#result = this.#result + this.#buffer;
                break;   

            case 'divide':
                this.#result = this.#result / this.#buffer;              
                break; 

            case 'multiply':
                this.#result = this.#result * this.#buffer;
                break;         
        }
    }

    setOperation(operation){
        if (this.#operation == ''){
            this.#operation = operation;
            this.#result = this.#buffer;
        }
        else{
            this.useOperation(this.#operation);
            this.#operation = operation;
        }
    }

    addToMemory(){
        this.#memory += this.#buffer;
    }

    substractFromMemory(){
        this.#memory -= this.#buffer 
    }

    readFromMemory(){
        return this.#memory;
    }

    getRes(){
        return this.#result;
    }

    getResult(){
        if (this.#operation != '') this.useOperation(this.#operation);
        else this.#result = this.#buffer;

        this.#operation = '';

        return this.#result;
    }

    getPercent(){
        switch (this.#operation){
            case 'summary':
                this.#result = this.#result + (this.#result / 100 * this.#buffer);
                this.#operation = '';
                break; 

            case 'multiply':
                this.#result = (this.#result / 100 * this.#buffer);
                this.#operation = '';
                break;

            case '':
                this.#result = this.#buffer;
                break;
        }
        return this.#result;
    }

    getRoot(){
        return this.#result = Math.sqrt(this.getResult());
    }

    reset(){
        this.#result = 0;
        this.#operation = '';
        this.#buffer = 0;
        this.#memory = 0;
    }

    setBuffer(buffer){
        this.#buffer = Number(buffer);
    }

    getBuffer(){
        return this.#buffer;
    }

    powerSwitched(state){
        this.#powered = !this.#powered;
        this.emit('power_state_changed');
        return this.#powered;
    }

    isPowered(){
        return this.#powered;
    }
}

class CalculatorView extends EventEmitter{
    #root;
    #keys = [];
    #screen;
    #screenSize = 1000;
    #keyboard;
    #switch;
    #model;
    #buffer = '0';
    #roundSwitch;
    #round = false;

    constructor(parts, model){
        super();

        this.#model = model;

        if (!this.#model instanceof CalculatorModel) throw new Error(`2nd parameter not an instance of CalculatorModel`);

        this.#root = document.querySelector(`#${parts.root}`);

        if (!this.#root) throw new Error(`Cannot find root with id ${parts.root}`);

        this.#screen = this.#root.querySelector(`#${parts.screen}`);

        if (!this.#screen) throw new Error(`Cannot find screen with id ${parts.screen} in #${parts.root}`);

        if (parts.screenSize) this.#screenSize = parts.screenSize;

        this.#keyboard = this.#root.querySelector(`#${parts.keyboard}`);

        if (!this.#keyboard) throw new Error(`Cannot find keyboard with id ${parts.keyboard} in #${parts.root}`);

        this.#keys = this.#keyboard.querySelectorAll('[data-key]');
        for (let key of this.#keys){
            switch (key.dataset.key){
                case 'number':
                    key.addEventListener('click', (e) => this.numberPressed(e.target.innerText));
                    break;

                case 'cancel':
                    key.addEventListener('click', (e) => this.cancel());
                    break;

                case 'point':
                    key.addEventListener('click', () => this.addPoint());
                    break;

                case 'diff':
                    key.addEventListener('click', () => this.useOperator('difference'));
                    break;

                case 'summ':
                    key.addEventListener('click', () => this.useOperator('summary'));
                    break;    

                case 'divide':
                    key.addEventListener('click', () => this.useOperator('divide'));
                    break;    

                case 'multiply':
                    key.addEventListener('click', () => this.useOperator('multiply'));
                    break;    

                case 'equals':
                    key.addEventListener('click', () => this.useResult('result'));
                    break;

                case 'reset':
                    key.addEventListener('click', () => this.reset());
                    break;

                case 'sqroot':
                    key.addEventListener('click', () => this.useResult('root'));
                    break;

                case 'memread':
                    key.addEventListener('click', () => this.readFromMemory());
                    break;

                case 'memadd':
                    key.addEventListener('click', () => this.useMemory('add'));
                    break;

                case 'memsubstract':
                    key.addEventListener('click', () => this.useMemory('substract'));
                    break;

                case 'percent':
                    key.addEventListener('click', () => this.useResult('percent'));
                    break;

                case 'round':
                    this.#roundSwitch = key;
                    key.addEventListener('click', (e) => this.switchRound(e.target));
                    break;
            }
        }

        this.#switch = this.#root.querySelector(`#${parts.switch}`);

        if (!this.#switch) this.changeSwitchState();

        this.#switch.addEventListener('click', () => this.changeSwitchState());
        this.#model.on('power_state_changed',() => this.updateParts());
    }
    
    useRound(number){
        if (this.#round){
            return number.round(2);
        }else{
            let trunc = Math.trunc(number);
            let places = this.#screenSize - String(trunc).length - 2;
            return number.round(places);
        }
    }

    switchRound(){
        this.#round = !this.#round;

        this.updateRoundSwitch();
    }

    readFromMemory(){
        this.#buffer = this.#model.readFromMemory();
        
        this.updateScreen();
    }   

    useMemory(operation){
        this.#model.setBuffer(this.#buffer);
        switch (operation){
            case 'add':
                this.#model.addToMemory();
                break;
            case 'substract':
                this.#model.substractFromMemory();
                break;
        }
    }

    useResult(operation){
        let result;
        this.#model.setBuffer(this.#buffer);
        switch (operation){
            case 'root':
                result = this.useRound(this.#model.getRoot());
                break;
            case 'percent':
                result = this.useRound(this.#model.getPercent());
                break;
            case 'result':
                result = this.useRound(this.#model.getResult());
                break;
        }
        this.#buffer = String(result);

        this.updateScreen();
    }

    useOperator(operation){
        const onlyZero = new RegExp(/^0*$/);
        if (onlyZero.test(this.#buffer) && operation === 'difference')
            this.#buffer = '-';
        else{
            this.#model.setBuffer(parseFloat(this.#buffer));
            this.#model.setOperation(operation);
            this.#buffer = '0';
            
            this.#screen.innerText = this.useRound(this.#model.getRes());
        }
    }

    reset(){
        this.#buffer = '0';

        this.#model.reset();

        this.updateScreen();
    }

    addPoint(){
        const alreadyHavePoint = new RegExp(/^.*\..*/, 'g' );
        
        if(!alreadyHavePoint.test(this.#buffer))
            this.#buffer += '.';
        
        this.updateScreen();
    }

    cancel(){
        this.#buffer = String(this.#buffer).slice(0,-1);
        if (this.#buffer.length <= 0) this.#buffer = '0';

        this.updateScreen();
    }

    changeSwitchState(){
        const state = this.#model.powerSwitched();
        if (state) this.#switch.classList.add('active');
        else this.#switch.classList.remove('active');
    }

    numberPressed(number){
        const onlyZero = new RegExp(/^0*$/);
        if (onlyZero.test(this.#buffer)){
            this.#buffer = number.toString();
        }else{
            this.#buffer += number.toString();
        }

        this.updateScreen();
    }

    updateParts(){
        const state = this.#model.isPowered();
        if (state) this.#screen.classList.add('active');
        else this.#screen.classList.remove('active');
        if (this.#roundSwitch) this.updateRoundSwitch();

        this.reset();
    }

    updateRoundSwitch(){
        if (this.#round){
            this.#roundSwitch.classList.add('active');
        }else{
            this.#roundSwitch.classList.remove('active');
        }
    }

    updateScreen(){
        if (String(this.#buffer).length < this.#screenSize){
            this.#screen.innerText = this.#buffer;
        }else{
            console.log(this.#buffer.length);
            this.#screen.innerText = 'Overflow';
        } 
    }
}

class CalculatorController extends EventEmitter{
    #view;
    #model;
    
    constructor(parts){
        super();
        try{
            this.#model = new CalculatorModel();
            this.#view = new CalculatorView(parts,this.#model);
        }catch(e){
            throw e;
        }
    }
}