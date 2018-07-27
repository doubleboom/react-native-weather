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
import axios from 'axios';
import moment from 'moment';
import Storage from './AsyncStorege';
import Header from './Header';

// type Props = {};
export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weatherData: [],
            loaded: false,
        };
        // 在ES6中，如果在自定义的函数里使用了this关键字，则需要对其进行“绑定”操作，否则this的指向会变为空
        // 像下面这行代码一样，在constructor中使用bind是其中一种做法（还有一些其他做法，如使用箭头函数等）
        this.fetchData = this.fetchData.bind(this);
        this.getPositionData = this.getPositionData.bind(this);
        this.renderWeather = this.renderWeather.bind(this);
        this.getPosition = this.getPosition.bind(this);
    }

    componentDidMount() {
        this.getPositionData();
    }

    getPosition(){
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let location = position.coords.longitude + "," + position.coords.latitude;
                this.fetchData(location);
            },
            (error) => {
                this.fetchData("114.25137329,22.72151184");
            },
            { timeout: 20000, maximumAge: 1000 }
        );
    }

    getPositionData() {
        if(this.state.loaded==true){
            this.setState({
                loaded: false,
            });
            this.getPosition();
        }
        else{
            this.setState({
                loaded: false,
            });
            Storage.get('todayWeatherData').then(data => {
                if (data == null || moment().isBefore(data[0].date))
                    throw ('data is null');
                this.setState({
                    weatherData: data,
                    loaded: true
                });
            }).catch(err => {
                this.getPosition();
            });
        }
    }

    fetchData(location) {
        axios.get('https://free-api.heweather.com/s6/weather/forecast', {
            params: {
                location: location,
                key: "d44000b64a3e4fa38860afec3966635a"
            }
        }).then((response) => {
            let resData = response.data.HeWeather6[0];
            let arrData = resData.daily_forecast.map((item, index) => {
                item.parent_city = resData.basic.parent_city;
                item.location = resData.basic.location;
                item.update_loc = resData.update.loc;
                return item;
            })
            this.setState({
                weatherData: arrData,
                loaded: true
            });
            Storage.save('todayWeatherData', arrData);
            Storage.get("historyWeatherData").then((data) => {
                if (Array.isArray(data)) {
                    let updateData = data.map((oldItem, mapIndex) => {
                        let newItem = arrData.filter((filteritem) => filteritem.date === oldItem.date)
                        if (newItem.length==0 )
                            return oldItem;
                        else
                            return newItem[0];
                    });
                    Storage.save('historyWeatherData', updateData);
                }
                else {
                    Storage.save('historyWeatherData', arrData);
                }
            }).catch((err) => Storage.save('historyWeatherData', arrData));
        }).catch(error => {
            console.log(error);
        })
    }

    renderLoadingView() {
        return (
            <View>
                <Header refresh={this.getPositionData} title='天气'></Header>
                <View style={styles.container}>
                    <Text>
                        正在加载数据...
                    </Text>
                </View>
            </View>
        );
    };

    renderWeather(weather) {
        let card = "card" + (weather.index + 1);
        let isNight = new Date().getHours > weather.item.ss ? true : false;
        let url = "w" + (!isNight ? weather.item.cond_code_d : weather.item.cond_code_n);
        let dateText = '今天';
        if (weather.index === 1) {
            dateText = '明天';
        }
        if (weather.index === 2) {
            dateText = '后天';
        }
        return (
            <View style={styles[card]} key={weather.index}>
                <View style={styles.leftContainer}>
                    <Text style={styles.date}>{dateText}</Text>
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

    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }
        return (
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={!this.state.loaded}
                    onRefresh={this.getPositionData}
                    tintColor="#1E90FF"
                    title="Loading..."
                    colors={['#ff0000', '#00ff00', '#0000ff']}
                    progressBackgroundColor="white"
                />
            }>
                <Header refresh={this.getPositionData} title='天气'></Header>
                <FlatList
                    data={this.state.weatherData}
                    renderItem={this.renderWeather}
                    style={styles.list}
                    keyExtractor={(item, index) => item.date}
                />
            </ScrollView>
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
        fontSize: 28,
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
