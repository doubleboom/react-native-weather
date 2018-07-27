import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AppRegistry,
    Image,
    FlatList,
    ToastAndroid,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import moment from 'moment';
import axios from 'axios';
import Storage from './AsyncStorege';
import Header from './Header';

// type Props = {};
export default class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weatherData: [],
            loaded: false,
            pageNum:1,
            allData:[],
        };
        // 在ES6中，如果在自定义的函数里使用了this关键字，则需要对其进行“绑定”操作，否则this的指向会变为空
        // 像下面这行代码一样，在constructor中使用bind是其中一种做法（还有一些其他做法，如使用箭头函数等）
        this.getStoregeData = this.getStoregeData.bind(this);
        this.renderWeather = this.renderWeather.bind(this);
        this._onEndReached = this._onEndReached.bind(this);
    }

    componentDidMount() {
        this.getStoregeData();
    }

    getStoregeData() {
        // this.setState({
        //     loaded: false,
        // });
        if(this.state.loaded){
            let data=this.state.allData;
            let renderData = data.splice(data.length - 5, 5);
            renderData=this.state.weatherData.concat(renderData);
            this.setState({
                weatherData: renderData,
                allData: data,
            });
        }
        else{
            Storage.get('historyWeatherData').then(data => {
                data=data.filter((item)=>moment().isSame(item.date)||moment().isAfter(item.date));
                // for (i = 0; i < 20; i++)
                //     data.push(data[0]);
                let renderData = data.splice(data.length-5,5);
                this.setState({
                    weatherData: renderData,
                    loaded: true,
                    allData: data,
                });
            }).catch(err => {
                alert('数据历史数据失败！');
            });
        }
    }

    renderLoadingView() {
        return (
            <View>
                <Header refresh={this.getStoregeData}></Header>
                <View style={styles.container}>
                    <Text>
                        正在加载数据...
                    </Text>
                </View>
            </View>
        );
    };

    renderWeather(weather) {
        let card = "card" + (weather.index % 3 + 1);
        let isNight = new Date().getHours > weather.item.ss ? true : false;
        let url = "w" + (!isNight ? weather.item.cond_code_d : weather.item.cond_code_n);
        return (
            <View style={styles[card]} key={weather.index}>
                <View style={styles.leftContainer}>
                    <Text style={styles.date}>{weather.item.date}</Text>
                    <Text style={styles.city}>{weather.item.parent_city}/{weather.item.location}</Text>
                    <Text style={styles.tep}>{weather.item.tmp_min}℃~{weather.item.tmp_max}℃</Text>
                    <Text style={styles.dayOrNight}>{weather.item.cond_txt_d}/{weather.item.cond_txt_n}</Text>
                    <Text style={styles.windDirection}>{weather.item.wind_dir}</Text>
                </View>
                <View style={styles.rightContainer}>
                    <Image
                        source={{ uri: url }} style={styles.weatherImage}
                    />
                    <Text style={styles.updateTime}>最后更新:{weather.item.update_loc}</Text>
                </View>
            </View>
        );
    }

    _onEndReached(){
        if(this.state.allData.length==0)
            ToastAndroid.show('没有更多的数据了',ToastAndroid.SHORT);
        else
            this.getStoregeData();
    }

    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return (
            <View>
             <Header refresh={this.getStoregeData} title='历史'></Header>
                <FlatList
                    data={this.state.weatherData}
                    renderItem={this.renderWeather}
                    style={styles.list}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={() => { this._onEndReached()}}
                    onEndReachedThreshold={0.2}
                />
                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20
    },
    header: {
        flex: 1,
    },
    title: {
        fontSize: 20
    },
    refresh: {
        fontSize: 10,
    },
    leftContainer: {
        flex: 1,
    },
    rightContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    weatherImage: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    date: {
        fontSize: 15,
        marginBottom: 8,
        textAlign: 'center',
        color: 'white',
    },
    city: {
        fontSize: 12,
        marginBottom: 8,
        color: 'white',
        textAlign: 'center',
    },
    tep: {
        fontSize: 25,
        marginBottom: 8,
        textAlign: 'center',
        color: 'white',
    },
    dayOrNight: {
        fontSize: 20,
        marginBottom: 8,
        textAlign: 'center',
        color: 'white',
    },
    windDirection: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
        color: 'white',
    },
    updateTime: {
        textAlign: 'center',
        color: 'white',
    },
    list: {
        backgroundColor: '#F5FCFF',
        marginBottom:50
        // borderWidth: 1,
        // borderColor: "#eee",
    },
    card1: {
        backgroundColor: '#30BCAF',
        margin: 5,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
    },
    card2: {
        backgroundColor: '#78ABE4',
        margin: 5,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
    },
    card3: {
        backgroundColor: '#FCB654',
        margin: 5,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
    },
});
