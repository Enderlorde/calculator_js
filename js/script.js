/*-----------------HTML------------------
#calculator
-#screen
-#keyboard
--<data-key="number/summ/divide/memres/memplus/memminus/diff/multiply/reset/cancel/point/equals">
---value
--</>
--<data-key='number'>
---(0-9)
--</>
-?#switch
-------------------CSS-------------------
.screen
?.screen.active

?.switch
?.switch.active
*/

const parts = {
    screen: "calculator_screen",
    screenSize: 15,
    keyboard: "calculator_keyboard",
    switch: "calculator_switch",
    root: "calculator",
}

window.addEventListener('load', () => {
    try {
        const calculator = new CalculatorController(parts);
        console.log(calculator);
    }catch(e){
        alert(e);
    }
});