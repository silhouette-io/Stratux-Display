// Generated by CoffeeScript 1.6.3
(function() {
  var RWY_STATE, decode_rmk, decode_std, int, moment, x;

  x = typeof exports !== "undefined" && exports !== null ? exports : this;

  moment = require('moment');

  int = function(s) {
    return parseInt(s, 10);
  };

  x.decode = function(s) {
    var ct, icao, res, t, tokens, ts, ts_date, ts_time;
    s = s.replace(/\n/g, " ");
    t = s.indexOf("=");
    if (t > -1) {
      s = s.substr(0, t);
    }
    tokens = s.split(" ");
    if (tokens[tokens.length - 1] === "") {
      tokens.pop();
    }
    if (tokens.length < 5) {
      return {
        err: "no_data"
      };
    }
    ct = 0;
    ts_date = tokens[ct].match(/^(\d\d\d\d)\/(\d\d)\/(\d\d)/);
    if (!ts_date) {
      return {
        err: "no_ts"
      };
    }
    ct += 1;
    ts_time = tokens[ct].match(/^(\d\d):(\d\d)/);
    if (!ts_time) {
      return {
        err: "no_ts"
      };
    }
    ct += 1;
    ts = moment.utc(ts_date[0] + " " + ts_time[0], "YYYY/MM/DD HH:mm", true);
    if (!ts.isValid()) {
      return {
        err: "no_ts"
      };
    }
    if (tokens[ct] === "METAR") {
      ct += 1;
    }
    if (tokens[ct] === "SPECI") {
      ct += 1;
    }
    icao = tokens[ct];
    if (icao.length !== 4) {
      return {
        err: "bad icao"
      };
    } else {
      ct += 1;
    }
    res = {
      icao: icao,
      ts: ts.toDate()
    };
    t = tokens[ct].match(/^(\d\d)(\d\d)(\d\d)Z$/);
    if (!t) {
      res.err = "invalid time";
      return res;
    }
    ct += 1;
    if (tokens[ct] === "AUTO") {
      ct += 1;
    }
    if (tokens[ct] === "COR") {
      ct += 1;
    }
    res.unk = [];
    while (ct < tokens.length) {
      if (decode_std(tokens[ct], res) === "RMK") {
        ct += 1;
        break;
      } else {
        ct += 1;
      }
    }
    while (ct < tokens.length) {
      decode_rmk(tokens[ct], res);
      ct += 1;
    }
    if (res.unk.length === 0) {
      delete res.unk;
    }
    return res;
  };

  decode_std = function(tok, res) {
    var t, vv, _ref, _ref1, _ref2, _ref3, _ref4;
    if (tok === "CAVOK") {
      res.cl = [0];
      res.vis = 9999;
      return;
    }
    if (tok === "NOSIG") {
      return;
    }
    if (tok === "NSW") {
      return;
    }
    if (RWY_STATE[tok]) {
      (res.flg != null ? res.flg : res.flg = []).push(tok);
      return;
    }
    if (tok === "TEMPO" || tok === "BECMG") {
      (res.flg != null ? res.flg : res.flg = []).push(tok);
      return;
    }
    if (tok === "SNOCLO") {
      (res.flg != null ? res.flg : res.flg = []).push(tok);
      return;
    }
    if (tok === "RMK") {
      return "RMK";
    }
    t = tok.match(/^Q(\d{3,4})$/);
    if (t) {
      res.q = int(t[1]);
      return;
    }
    t = tok.match(/^(M?\d\d)\/(M?\d\d)$/);
    if (t) {
      res.t = t[1].charAt(0) === 'M' ? -int(t[1].substring(1)) : int(t[1]);
      res.d = t[2].charAt(0) === 'M' ? -int(t[2].substring(1)) : int(t[2]);
      return;
    }
    t = tok.match(/^(\d{3}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS|KMH)$/);
    if (t) {
      if (t[4] !== "MPS") {
        res.unk.push(tok);
        return;
      }
      res.b = t[1] === "VRB" ? 360 : int(t[1]);
      res.w = int(t[2]);
      if (t[3]) {
        res.g = int(t[3].substring(1));
      }
      return;
    }
    t = tok.match(/^(\d\d\d\d)(N|NE|E|SE|S|SW|W|NW)?$/);
    if (t) {
      res.vis = int(t[1]);
      if (t[2]) {
        res.vid = t[2];
      }
      return;
    }
    t = tok.match(/^VV(\d{3}|\/{3})$/);
    if (t) {
      vv = int(t[1]);
      if (vv) {
        res.vv = 30 * vv;
      }
      return;
    }
    t = tok.match(/^(SKC|CLR|NSC|NCD|FEW|SCT|BKN|OVC)(\d{3})(CB|CI|CU|TCU)?$/);
    if (t) {
      res.cl = [
        (function() {
          switch (t[1]) {
            case "SKC":
            case "CLR":
            case "NSC":
            case "NCD":
              return 0;
            case "FEW":
              return 2;
            case "SCT":
              return 4;
            case "BKN":
              return 7;
            case "OVC":
              return 8;
          }
        })()
      ];
      res.cl.push(30 * int(t[2]));
      if (t[3]) {
        res.cl.push(t[3]);
      }
      return;
    }
    t = tok.match(/^(\-|\+|VC)?(BC|BL|DR|FZ|MI|PR|SH|TS)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP)?(BR|FG|FU|VA|DU|SA|HZ|PY)?(PO|SQ|FC|SS|DS)?$/);
    if (t) {
      res.prw = [(_ref = t[1]) != null ? _ref : '', (_ref1 = t[2]) != null ? _ref1 : '', (_ref2 = t[3]) != null ? _ref2 : '', (_ref3 = t[4]) != null ? _ref3 : '', (_ref4 = t[5]) != null ? _ref4 : ''];
      return;
    }
    res.unk.push(tok);
  };

  decode_rmk = function(tok, res) {
    var t;
    t = tok.match(/^QBB(\d{3})$/);
    if (t) {
      res.clb = int(t[1]);
      return;
    }
    t = tok.match(/^QFE(\d\d\d(\.\d+)?)(\/\d\d\d\d)?$/);
    if (t) {
      if (t[3]) {
        res.p = int(t[3].substring(1));
      } else {
        res.p = Math.round(parseFloat(t[1]) * 1.3332239);
      }
      return;
    }
    t = tok.match(/^(\d\d)(([\d\/]{4})|(CLRD))([\d\/]{2})$/);
    if (t) {
      (res.rwy != null ? res.rwy : res.rwy = {})[t[1]] = t[2] !== "////" ? {
        dep: t[2],
        fc: t[5]
      } : {
        fc: t[5]
      };
      return;
    }
    res.unk.push(tok);
  };

  x.PRW_RUS = {
    VCFG: "туман на расстоянии",
    FZFG: "переохлаждённый туман",
    MIFG: "туман поземный",
    PRFG: "туман просвечивающий",
    FG: "туман",
    BR: "дымка",
    HZ: "мгла",
    FU: "дым",
    DS: "пыльная буря",
    SS: "песчаная буря",
    DRSA: "песчаный позёмок",
    DRDU: "пыльный позёмок",
    DU: "пыль в воздухе (пыльная мгла)",
    DRSN: "снежный позёмок",
    BLSN: "метель",
    RASN: "дождь со снегом",
    SNRA: "снег с дождём",
    SHSN: "ливневой снег",
    SHRA: "ливневой дождь",
    DZ: "морось",
    SG: "снежные зёрна",
    RA: "дождь",
    SN: "снег",
    IC: "ледяные иглы",
    PL: "ледяной дождь (гололёд)",
    GS: "ледяная крупа (гололёд)",
    FZRA: "переохлаждённый дождь (гололёд)",
    FZDZ: "переохлаждённая морось (гололёд)",
    TSRA: "гроза с дождём",
    TSGR: "гроза с градом",
    TSGS: "гроза, слабый град",
    TSSN: "гроза со снегом",
    TS: "гроза без осадков",
    SQ: "шквал",
    GR: "град"
  };

  RWY_STATE = {
    RETS: "Thunderstorm",
    REFZRA: "Freezing rain",
    REFZDZ: "Freezing drizzle",
    RERA: "Moderate or heavy rain",
    RESN: "Moderate or heavy snow",
    REDZ: "Moderate or heavy drizzle",
    REPL: "Moderate or heavy ice pellets",
    RESG: "Moderate or heavy snow grains",
    RESHRA: "Moderate or heavy showers of rain",
    RESHSN: "Moderate or heavy showers of snow",
    RESHGS: "Moderate or heavy shower of small hail",
    RESHGS: "Moderate or heavy showers of snow pellets",
    RESHGR: "Moderate or heavy showers of hail",
    REBLSN: "Moderate or heavy blowing snow",
    RESS: "Sandstorm",
    REDS: "Dust storm",
    REFC: "Funnel cloud",
    REVA: "Volcanic ash"
  };

  x.RWY_STATE = RWY_STATE;

}).call(this);
