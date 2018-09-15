import React, { Component } from 'react';
import { Button } from 'semantic-ui-react'
import { Input, Table } from 'semantic-ui-react'
import axios from 'axios';
import '../App.css'
import './Ui.css';
import BubbleChart from '@weknow/react-bubble-chart-d3';

const key = 'djgNSiWHONqcmgz2NnfmDZb6RJLXThUIZfLRJUHPJp8AzCbiR63AmHvkyfeAzLAu';

const makeMap = (words) => {
    const test = [];

    words.forEach(word => {
        const obj = {};
        const find = test.find(element => element.label === word);
        if (find === undefined) {
            obj.label = word;
            obj.value = 1;
            test.push(obj);
        }
        else {
            find.value++;
        }

    });

    return test;
};

let tries = 5;
let correct = 0;
class SearchBox extends Component {
    state = {
        song: '',
        artist: '',
        data: [],
        display: false,
        top5: [],
        game: false,
        guess: '',
        message:''
    };

    makeSetState = name => ({ target }) =>
        this.setState({ [name]: target.value });

    search = (game) => {
        this.setState({ game: false });
        const { song, artist } = this.state;
        const db = this.props.database;
        return axios.get(`https://orion.apiseeds.com/api/music/lyric/${artist}/${song}?apikey=${key}`)
            .then(response => response.data.result.track.text)
            .then(text => text.replace(/\[(.*?)\]/g, ""))
            .then(text => text.replace(/[,\(\)]/g, ""))
            .then(text => text.split(/\s/))
            .then(words => words.filter(str => str.length > 2))
            .then(words => words.map(word => word.toLowerCase()))
            .then(words => makeMap(words))
            .then(data => {
                let freqs = {};
                data.forEach((element) => {
                    freqs[element.label] = element.value;
                });
                db.collection("Lyrics").doc(song.toLowerCase() + " " + artist.toLowerCase()).set(freqs);
                let top5 = data.sort((a, b) => b.value - a.value);
                top5 = top5.slice(0, 5);
                this.setState({ data: data, top5: top5 });
            }).catch(error => console.log(error))
            .then(() => {
                if (!game) {
                    this.setState({ display: true });
                }
            })///for Database;
            .catch(error => console.error(error));
    };

    game = () => {
        tries = 5;
        correct = 0;
        this.setState({ display: false });
        const { song, artist, data } = this.state;
        const db = this.props.database;
        var getLyrics = db.collection("Lyrics").doc(song.toLowerCase() + " " + artist.toLowerCase()).get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('Adding Song To Database....');
                    this.search(true);
                }
                else {
                    const words = doc.data();
                    const arr = [];

                    for (let word in words) {
                        arr.push({
                            word,
                            count: words[word]
                        });
                    }
                    let top5 = arr.sort((a, b) => b.count - a.count);
                    top5 = top5.slice(0, 5);
                    this.setState({ top5 });
                }
            })
            .then(() => {
                console.log(this.state);
                this.setState({ game: true });
            });
    };

    
    match = () => {
        const { guess } = this.state;
        for (let i = 0; i < 5; i++) {
            if (guess === this.state.top5[i].word) {
                correct++;
            }
        }
        tries--;
        if(correct == 5 && tries == 0){
            this.setState({message: 'Good job!'});
        }
        else if ((correct == 3 || correct == 4) && tries == 0){
            this.setState({message:'Not bad!'});
        }
        else{
            if(tries == 0 && correct < 3){
                this.setState({message:'Better luck next time!'});
            }
            
        }   
    };

    render() {
        const { display, data, game, top5 } = this.state
        return (
            <div className="searchBox" >
                <h1 class="music-title">MUSIC SEARCH</h1>
                <Input type='text' placeholder='Song Name' onChange={this.makeSetState('song')} />
                <br />
                <Input type='text' placeholder='Artist' onChange={this.makeSetState('artist')} />
                <br />
                <Button onClick={() => this.search(false)} > Search </Button>
                <Button onClick={() => this.game()} > MiniGame </Button>
                <br />
                <br />
                <div>
                    {game ?
                        <div className="gameBox">
                            <Input type='text' placeholder='Enter Highest Frequency Word' onChange={this.makeSetState('guess')} />
                            <Button onClick={() => this.match()} > Enter </Button>
                            <br />
                            <br />
                            {tries > 0 ? <span></span> :
                                <div class="words">
                                <h2>Words</h2>
                                <div>{this.state.top5[0].word} </div>
                                <div>{this.state.top5[1].word} </div> 
                                <div>{this.state.top5[2].word} </div> 
                                <div>{this.state.top5[3].word} </div>                                                                                                                     
                                <div>{this.state.top5[4].word} </div>
                                <div>{this.state.message}</div>
                                <div class="message">{"You got " + correct + " words correct"}</div>
                                </div>   
                            }
                                   
                        </div>
                        :
                        <span></span>
                    }
                    {display ? (
                        <div class="bubble-chart">                        
                            <BubbleChart
                                data={data}
                                width={1000}
                                height={1200}
                                graph={{ zoom: 0.95 }}
                                showLegend={false}
                            />
                        </div>
                    ) : <div></div>                                                                                                                
                    }
                </div>
            </div>
        );
    }
}

export default SearchBox;