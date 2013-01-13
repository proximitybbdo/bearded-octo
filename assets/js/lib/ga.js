/*global _gaq*/
var extga = {
  _fm: false,
  _fr: false,
  _rc: function (e) {
    var d = new RegExp(e + "=([^;]*)", "i");
    var f = document.cookie.match(d);

    return (f && f.length === 2) ? f[1] : null;
  },
  _Ua: function(d) {
   if (d !== "") return " domain=" + d;
   else if (document.domain.match(/^www/) !== null) return " domain="+document.domain.replace(/^www/, "");
   else return " domain="+document.domain;
  },
  _sc: function (f, c, e) {
    var b = new Date();
    b.setTime(b.getTime() + (((typeof(e) !== "undefined") ? e : 3) * 24 * 60 * 60 * 1000));
    var s = f + "=" + c + "; expires=" + b.toGMTString() + "; path=/;"+this._Ua(this.domain);
    document.cookie = s;
  },
  _reset: false,
  _setCampValues: function (e, a, h, b, g, f) {
    extga.domain = f || "";
    extga.outmz = new Utmz(extga._rc("__utmz"));

    _gaq.push(["_initData"]);

    extga.nutmz = new Utmz(extga._rc("__utmz"));

    if (extga.outmz.s != extga.nutmz.s) {
      extga._fr = true;
      extga.outmz = new Utmz(extga._rc("__utmz"));
    } else {
      if (extga.outmz.isNew())
        extga._direct = true;
    }

    if (extga._getCampValues().medium === "referral")
      extga._fm = true;

    if (extga._fm || !extga._fr) {
      if (extga._reset)
        extga.nutmz._reset();

      if (e)
        extga.nutmz._setCampSource(e);

      if (a)
        extga.nutmz._setCampMedium(a);

      if (h)
        extga.nutmz._setCampName(h);

      if (b)
        extga.nutmz._setCampTerm(b);

      if (g)
        extga.nutmz._setCampContent(g);
    }
  },
  _getCampValues: function () {
    var e = {
      sr: "source",
      cn: "name",
      md: "medium",
      ct: "content",
      tr: "term"
    };

    var d = unescape(extga._rc("__utmz"));

    var f = {
      source: "",
      medium: "",
      name: "",
      term: "",
      content: "",
      isDirect: function () {
        return (f.content === "" && f.medium === "(none)" && f.name === "(direct)" && f.source === "(direct)" && f.term === "");
      },
      isOrganic: function () {
        return (f.medium === "organic" && f.name === "(organic)");
      },
      isCampaign: function (b) {
        var a = new RegExp("(" + b + ")");
        return f.name.match(a) !== null;
      }
    };

    if (d !== null) {
      d.replace(/utmc([a-z]{2})=([^\|]*)/g, function (b, c, a) {
        f[e[c]] = a;
      });
    }
    return f;
  }
};
function Utmz(b) {
  this.v = unescape(b);
  this.sr = "(direct)";
  this.cn = "(direct)";
  this.cmd = "(none)";
  this.s = "utmcsr=" + this.sr + "|utmccn=" + this.cn + "|utmcmd=" + this.cmd;

  if (b !== null) {
    this.s = b.replace(/^[0-9\.]*/, "");

    b.replace(/utmcsr=([^\|]*)\|utmccn=([^\|]*)\|utmcmd=([^|]*)/, function () {
      this.sr = arguments[1];
      this.cn = arguments[2];
      this.cmd = arguments[3];
    });
  }

  this.sv = function () {
    extga._sc("__utmz", this.v, 182);
  };

  this.isNew = function () {
    return this.v === "null";
  };

  this._setCampName = function (c) {
    this.v = this.v.replace(/utmccn=([^\|]*)/, "utmccn=" + c);
    this.sv();
  };

  this._setCampSource = function (c) {
    this.v = this.v.replace(/utmcsr=([^\|]*)/, "utmcsr=" + c);
    this.sv();
  };

  this._setCampMedium = function (c) {
    this.v = this.v.replace(/utmcmd=([^\|]*)/, "utmcmd=" + c);
    this.sv();
  };

  this._setCampTerm = function (c) {
    this.v = this.v.match(/utmctr=/) ? this.v.replace(/utmctr=([^\|]*)/, "utmctr=" + c) : this.v + "|utmctr=" + c;
    this.sv();
  };

  this._setCampContent = function (c) {
    this.v = this.v.match(/utmcct=/) ? this.v.replace(/utmcct=([^|]*)/, "utmcct=" + c) : this.v + "|utmcct=" + c;
    this.sv();
  };

  this._reset = function () {
   this.v = this.v.replace(/^([0-9\.]*).*$/, "$1utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)");
  };
}