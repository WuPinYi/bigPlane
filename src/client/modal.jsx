const React = require('react'),
    { connect } = require('react-redux');

class Modal extends React.Component {

    componentWillReceiveProps(nextProps) {
        if(this.props.modal.isOpen !== nextProps.modal.isOpen) {
            if(nextProps.modal.isOpen)
                document.body.classList.add('modalOpened');
            else
                document.body.classList.remove('modalOpened');
        }
    }

    render() {
        const { modal, name, dispatch, style, children, unclosable } = this.props,
            { isOpen, active } = modal;

        if(!isOpen || active != name)
            return null;

        const close = ()=>{
            if(unclosable)
                return;
            dispatch({
                type: 'MODAL_CLOSE'
            })
        };

        let className = '';

        if(this.props.className !== undefined){
            className = this.props.className;
        }

        return (
            <div className={`modal ${className}`} onClick={close}>
                <div onClick={(e)=>{e.stopPropagation()}} style={style}>
                    {children}
                </div>
            </div>
        );    
    }
}

const openModal = (name, data) => ({
    type: 'MODAL_OPEN',
    name,
    data
});

const closeModal = ()=>({
    type: 'MODAL_CLOSE'
});

Modal = connect(state => ({
    modal: state.modal
}))(Modal);

module.exports = Modal;
module.exports.openModal = openModal;
module.exports.closeModal = closeModal;
