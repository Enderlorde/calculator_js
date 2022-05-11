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

class CalculatorModel extends EventEmitter{
    #powered = false;
    #buffer = 0;
    #operation = '';
    #result = 0;

    constructor(){
        super();

        
    }

    setOperation(operation){
        if (this.#operation == ''){
            this.#operation = operation;
            this.#result = this.#buffer;
            console.log(this.#result + ' soo ' + this.#buffer);
        }
        else{
            switch (this.#operation){
                case 'difference':
                    this.#result = this.#result - this.#buffer;
                    this.#operation = operation;
                    console.log(this.#result +' so ' + this.#buffer);
                    break;
            }
        }
    }

    getResult(){
        switch (this.#operation){
            case 'difference':
                this.#result = this.#result - this.#buffer;
                this.#operation = '';
                console.log(this.#result + ' gr ' + this.#buffer);
                break;
        }
        return this.#result;
    }

    setBuffer(buffer){
        this.#buffer = buffer;
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
    #numberKeys = [];
    #keys = [];
    #screen;
    #keyboard;
    #switch;
    #model;
    #buffer = '0';

    constructor(parts, model){
        super();

        this.#model = model;

        if (!this.#model instanceof CalculatorModel) throw new Error(`2nd parameter not an instance of CalculatorModel`);

        this.#root = document.querySelector(`#${parts.root}`);

        if (!this.#root) throw new Error(`Cannot find root with id ${parts.root}`);

        this.#screen = this.#root.querySelector(`#${parts.screen}`);

        if (!this.#screen) throw new Error(`Cannot find screen with id ${parts.screen} in #${parts.root}`);

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
                    key.addEventListener('click', () => this.difference());
                    break;
                case 'equals':
                    key.addEventListener('click', () => this.showResult());
                    break;
            }
        }


        this.#switch = this.#root.querySelector(`#${parts.switch}`);

        if (!this.#switch) this.changeSwitchState();

        this.#switch.addEventListener('click', () => this.changeSwitchState());
        this.#model.on('power_state_changed',() => this.updateParts());
    }

    showResult(){
        this.#model.setBuffer(this.#buffer);
        const result = this.#model.getResult();
        this.#buffer = result;

        this.updateScreen();
    }

    difference(){
        const onlyZero = new RegExp(/^0*$/);
        if (onlyZero.test(this.#buffer))
            this.#buffer = '-';
        else{
            this.#model.setBuffer(parseFloat(this.#buffer));
            this.#model.setOperation('difference');
            
            this.#buffer = '0';
        }
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

    updateParts(){
        const state = this.#model.isPowered();
        if (state) this.#screen.classList.add('active');
        else this.#screen.classList.remove('active');

        this.#buffer = this.#model.getBuffer();
        this.updateScreen();
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

    updateScreen(){
        this.#screen.innerText = this.#buffer;
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