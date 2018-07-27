import React, { PropTypes } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    ToolbarAndroid,
    ToastAndroid,
} from 'react-native';
import nativeImageSource from 'nativeImageSource'

class Header extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <ToolbarAndroid
                actions={toolbarActions}
                style={styles.toolbar}
                title={this.props.title}
                titleColor="#3AB49F"
                onActionSelected={(position) => { this.props.refresh()}}/>
        );
    }
}

var toolbarActions = [
    {
        title: 'Refresh', icon: require('./images/refresh.png'), show: 'always'
    },
];

const styles = StyleSheet.create({
    toolbar: {
        backgroundColor: 'white',
        height: 46,
        borderBottomWidth :5,
        borderColor :'black'
    },
});

export default Header;