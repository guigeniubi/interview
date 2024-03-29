function createElement(type:any, props, ...children) {

    return {
        type,
        props: {
            ...props,
            children: children?.map(child => {
                typeof child === 'object'
                    ?child
                    :createTextElement(child)
            })
        }
    }

}

function createTextElement(text){
    return {
        typeL:'TEXT_ELEMENT',
        props:{
            nodeValue:text,
            children:[]

        }
    }
}
export default createElement;