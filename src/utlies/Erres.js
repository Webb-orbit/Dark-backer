class Erres extends Error{
    constructor(ststuscode, message="some thing went wrong", errs=[]){
        super(message)
        this.ststuscode = ststuscode,
        this.message = message,
        this.errs = errs    
    }
}

export default Erres