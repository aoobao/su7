import { Mesh, Vector3 } from 'three'

export class CarControl {
  car: Mesh
  speed = 0
  maxSpeed = 0
  acc = 0
  constructor(car: Mesh, defaultPosition: Vector3) {
    car.position.copy(defaultPosition)
    this.car = car
    this.initAcc()
  }
  maxDistance = randBetween(5, 20)
  updateProperty(delta: number) {
    if (this.needChange()) this.initAcc()
    this.updateSpeed(delta)
    this.center.x += this.speed * delta

    // console.log(this.center.x, this.speed);
  }

  needChange() {
    const length = Math.abs(this.center.x)
    if (length < this.maxDistance) return false

    if (this.center.x > 0) {
      if (this.acc > 0) return true
    } else {
      if (this.acc < 0) return true
    }

    return false
  }

  updateSpeed(delta: number) {
    if (this.acc > 0) {
      if (this.speed >= this.maxSpeed) return
      this.speed = Math.min(this.speed + this.acc * delta, this.maxSpeed)
    } else if (this.acc < 0) {
      if (this.speed <= this.maxSpeed) return
      this.speed = Math.max(this.speed + this.acc * delta, this.maxSpeed)
    }
  }

  initAcc() {
    this.maxSpeed = randBetween(1, 3)
    this.acc = randBetween(5, 10)
    if (this.center.x >= this.maxDistance) {
      this.acc *= -1

      this.maxSpeed *= -1
    }

    this.maxDistance = randBetween(5, 20)

    // console.log('init', this.maxSpeed, this.acc, this.speed, this.maxDistance)
  }

  get center() {
    return this.car.position
  }

  update(delta: number) {
    const d = Math.min(delta, 0.3)
    this.updateProperty(d)
  }
}

function randBetween(min: number, max: number) {
  return min + (max - min) * Math.random()
}
